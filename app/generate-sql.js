import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scriptEvents = new EventEmitter();

const config = 
{
    user: 'piqsoft',
    password: 'Piqpos2023*/',
    server: 'sqlsrvc.database.windows.net',
    database: 'VERSION',
    options: 
    {
        encrypt: true,
        trustServerCertificate: true,
        database: 'VERSION'
    },
    requestTimeout: 300000,
    connectionTimeout: 300000,
    pool: 
    {
        max: 10,
        min: 0,
        idleTimeoutMillis: 300000
    }
};
const DATA_TABLES = 
[
    'COUNTRY',
    'DB_LANGUAGE',
    'DEPOT',
    'ITEM_PRICE_LIST',
    'LABEL_DESIGN',
    'MAIL_SETTINGS',
    'POS_PAY_TYPE',
    'UNIT',
    'USERS',
    'VAT',
    'ZIPCODE'
];

// Azure Storage Mount Path
const versionPath = process.env.VERSION_PATH || path.join(__dirname, '../version');

function ensureDirectoryExists(versionFolder) 
{
    const fullPath = path.join(versionPath, versionFolder);
    const dbPath = path.join(fullPath, 'db');

    if (!fs.existsSync(fullPath)) 
    {
        console.log(`Creating version folder: ${versionFolder}`);
        fs.mkdirSync(fullPath, { recursive: true });
    }

    if (!fs.existsSync(dbPath)) 
    {
        console.log(`Creating db folder in: ${versionFolder}`);
        fs.mkdirSync(dbPath);
    }
}
function execute(pQuery)
{
    return new Promise(resolve =>
    {
        try
        {
            const pool = new sql.ConnectionPool(config, err => 
            {
                const request = pool.request();
                request.query(pQuery,(err,result) => 
                {
                    if(err == null)
                    {   
                        resolve(result);
                    }
                    else
                    {
                        resolve({recordset : [], output : {}});
                    }
                    pool.close();
                });
            });
        }
        catch (err)
        {
            resolve({recordset : [], output : {}});
        }
    });
}
async function generateTableScripts(versionFolder) 
{
    scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Starting table scripts generation' });

    const tablesQuery = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;

    const columnsQuery = (tableName) => `
    SELECT 
        c.COLUMN_NAME,
        c.DATA_TYPE,
        c.CHARACTER_MAXIMUM_LENGTH,
        c.COLUMN_DEFAULT,
        c.IS_NULLABLE,
        COLUMNPROPERTY(OBJECT_ID(c.TABLE_SCHEMA + '.' + c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') as IS_IDENTITY,
        tc.CONSTRAINT_NAME,
        tc.CONSTRAINT_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS c
    LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
        ON c.TABLE_NAME = kcu.TABLE_NAME 
        AND c.COLUMN_NAME = kcu.COLUMN_NAME
    LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
        ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME 
        AND tc.TABLE_NAME = c.TABLE_NAME
        AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    WHERE c.TABLE_NAME = '${tableName}'
    ORDER BY c.ORDINAL_POSITION`;

    const result = await execute(tablesQuery);
    let scripts = '';

    for (const row of result.recordset)
    {
        const tableName = `[${row.TABLE_NAME}]`;
        
        scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: `Processing table: ${tableName}` });

        scripts += `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${row.TABLE_NAME}')\n`;
        scripts += `BEGIN\n`;
        scripts += `    CREATE TABLE ${tableName} (\n`;
        
        const columnsResult = await execute(columnsQuery(row.TABLE_NAME));

        const primaryKeyInfo = columnsResult.recordset.filter(col => col.CONSTRAINT_TYPE === 'PRIMARY KEY').reduce((acc, col) => 
        {
            acc.columns.push(`[${col.COLUMN_NAME}]`);
            if (!acc.constraintName) 
            {
                acc.constraintName = `PK_${row.TABLE_NAME}`;
            }
            return acc;
        }, { columns: [], constraintName: null });

        columnsResult.recordset.forEach((column, index) => 
        {
            const columnName = `[${column.COLUMN_NAME}]`;

            const dataType = column.DATA_TYPE;
            let maxLength = '';
            if (column.CHARACTER_MAXIMUM_LENGTH) 
            {
                maxLength = column.CHARACTER_MAXIMUM_LENGTH === -1 ? '(max)' : `(${column.CHARACTER_MAXIMUM_LENGTH})`;
            }
            const nullable = column.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
            const identity = column.IS_IDENTITY ? 'IDENTITY(1,1)' : '';
            
            let defaultValue = '';
            if (column.COLUMN_DEFAULT) 
            {
                defaultValue = column.COLUMN_DEFAULT.replace(/[\(\)]/g, '').trim();
                if (defaultValue.toLowerCase() === 'newid') 
                {
                    defaultValue = 'newid()';
                }
                defaultValue = ` DEFAULT ${defaultValue}`;
            }

            scripts += `        ${columnName} ${dataType}${maxLength} ${identity} ${nullable}${defaultValue}`;
            scripts += (index < columnsResult.recordset.length - 1 || primaryKeyInfo.columns.length > 0) ? ',\n' : '\n';
        });

        if (primaryKeyInfo.columns.length > 0) 
        {
            scripts += `        CONSTRAINT [${primaryKeyInfo.constraintName}] PRIMARY KEY (${primaryKeyInfo.columns.join(', ')})\n`;
        }

        scripts += `    );\n`;

        if(DATA_TABLES.includes(row.TABLE_NAME))
        {
            scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: `Generating data for table: ${tableName}` });
            
            // Tablodaki verileri çek
            const dataQuery = `SELECT * FROM ${row.TABLE_NAME}`;
            const dataResult = await execute(dataQuery);
            
            if(dataResult.recordset.length > 0)
            {
                // Kolon isimlerini al
                const columns = Object.keys(dataResult.recordset[0])
                    .map(col => `[${col}]`)
                    .join(', ');
                
                // Her kayıt için INSERT script'i oluştur
                for(const dataRow of dataResult.recordset)
                {
                    const values = Object.values(dataRow).map(val => 
                    {
                        if(val === null) return 'NULL';
                        if(typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if(val instanceof Date) return `'${moment(val).format('YYYY-MM-DD HH:mm:ss')}'`;
                        if(typeof val === 'boolean') return val ? '1' : '0';  // Boolean değerleri 0/1'e çevir
                        return val;
                    }).join(', ');
                    
                    scripts += `    INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
                }
            }
        }

        scripts += `END\n`;
        scripts += `ELSE\n`;
        scripts += `BEGIN\n`;

        columnsResult.recordset.forEach((column) => 
        {
            const columnName = column.COLUMN_NAME;
            scripts += `    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${row.TABLE_NAME}' AND COLUMN_NAME = '${columnName}')\n`;
            scripts += `    BEGIN\n`;
            
            const dataType = column.DATA_TYPE;
            let maxLength = '';
            if (column.CHARACTER_MAXIMUM_LENGTH) 
            {
                maxLength = column.CHARACTER_MAXIMUM_LENGTH === -1 ? '(max)' : `(${column.CHARACTER_MAXIMUM_LENGTH})`;
            }
            const nullable = column.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
            
            let defaultValue = '';
            if (column.COLUMN_DEFAULT) 
            {
                defaultValue = column.COLUMN_DEFAULT.replace(/[\(\)]/g, '').trim();
                if (defaultValue.toLowerCase() === 'newid') 
                {
                    defaultValue = 'newid()';
                }
                defaultValue = ` DEFAULT ${defaultValue}`;
            }

            scripts += `        ALTER TABLE ${tableName} ADD [${columnName}] ${dataType}${maxLength} ${nullable}${defaultValue};\n`;
            scripts += `    END\n`;
        });

        scripts += `END\n\n`;
        scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: `Completed processing: ${tableName}` });
    }

    const filePath = path.join(versionPath, versionFolder, 'db', 'T.sql');
    fs.writeFileSync(filePath, scripts);
    scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Table scripts generation completed' });
}
async function generateVFPI(versionFolder) 
{
    scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Starting VFPI scripts generation' });

    let scripts = '';

    const dependencyQuery = `
    WITH RECURSIVE_DEPS AS 
    (
        -- Bağımlılıkları olan tüm objeleri al
        SELECT DISTINCT
            o.object_id,
            SCHEMA_NAME(o.schema_id) as schema_name,
            o.name,
            o.type,
            o.create_date,
            CAST(0 AS INT) as dependency_level,
            CAST(o.name AS VARCHAR(MAX)) as dependency_chain
        FROM sys.objects o
        WHERE o.type IN ('FN', 'P', 'V')
            AND is_ms_shipped = 0

        UNION ALL

        -- Recursive olarak bağımlılıkları bul
        SELECT 
            o.object_id,
            SCHEMA_NAME(o.schema_id),
            o.name,
            o.type,
            o.create_date,
            rd.dependency_level + 1,
            CAST(rd.dependency_chain + ' -> ' + o.name AS VARCHAR(MAX))
        FROM sys.objects o
        INNER JOIN sys.sql_expression_dependencies d ON o.object_id = d.referencing_id
        INNER JOIN RECURSIVE_DEPS rd ON d.referenced_id = rd.object_id
        WHERE o.type IN ('FN', 'P', 'V')
            AND is_ms_shipped = 0
    )
    SELECT 
        schema_name,
        name,
        type,
        MAX(dependency_level) as max_level,
        STRING_AGG(dependency_chain, ' | ') as dependencies
    FROM RECURSIVE_DEPS
    GROUP BY schema_name, name, type, create_date
    ORDER BY 
        MAX(dependency_level),
        CASE type 
            WHEN 'FN' THEN 1   -- Önce Fonksiyonlar
            WHEN 'V' THEN 2    -- Sonra View'lar
            WHEN 'P' THEN 3    -- En son Prosedürler
        END,
        create_date;`;

    const dependencyResult = await execute(dependencyQuery);
    const objects = dependencyResult.recordset;

    for (const obj of objects) 
    {
        const schemaName = obj.schema_name;
        const objectName = `[${schemaName}].[${obj.name}]`;
        
        const objectDefinitionQuery = `SELECT OBJECT_DEFINITION(OBJECT_ID('${schemaName}.${obj.name}')) as definition`;
        
        const objectDefinition = await execute(objectDefinitionQuery);
        if (!objectDefinition.recordset[0].definition) 
        {
            scriptEvents.emit('progress', 
            { 
                process: 'SQL-SCRIPT', 
                message: `Warning: No definition found for ${objectName}` 
            });
            continue;
        }

        let definition = objectDefinition.recordset[0].definition;

        scriptEvents.emit('progress', 
        { 
            process: 'SQL-SCRIPT', 
            message: `Processing ${obj.type} ${objectName}` 
        });

        if(obj.type.trim() === 'FN')
        {
            scripts += `DROP FUNCTION IF EXISTS ${objectName};\nGO\n\n`;
            scripts += `${definition}\nGO\n\n`;
        }
        else if(obj.type.trim() === 'V')
        {
            scripts += `DROP VIEW IF EXISTS ${objectName};\nGO\n\n`;
            scripts += `${definition}\nGO\n\n`;
        }
        else if(obj.type.trim() === 'P')
        {
            scripts += `DROP PROCEDURE IF EXISTS ${objectName};\nGO\n\n`;
            scripts += `${definition}\nGO\n\n`;
        }   

        scriptEvents.emit('progress', 
        { 
            process: 'SQL-SCRIPT', 
            message: `Generated ${obj.type} script for ${objectName} (Level: ${obj.max_level})` 
        });
    }

    const filePath = path.join(versionPath, versionFolder, 'db', 'VFP.sql');
    fs.writeFileSync(filePath, scripts);
    scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'VFPI scripts generation completed' });
}
async function generateIndex(versionFolder) 
{
    scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Starting index scripts generation' });
    let scripts = '';

    const normalIndexQuery = `
    SELECT
        t.name AS table_name,
        i.name AS index_name,
        i.type_desc AS index_type,
        i.is_unique,
        i.fill_factor,
        (
            SELECT STRING_AGG(c.name, ', ')
            FROM sys.index_columns ic
            JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            WHERE ic.object_id = i.object_id 
            AND ic.index_id = i.index_id
            AND ic.is_included_column = 0
        ) as key_columns,
        (
            SELECT STRING_AGG(c.name, ', ')
            FROM sys.index_columns ic
            JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            WHERE ic.object_id = i.object_id 
            AND ic.index_id = i.index_id
            AND ic.is_included_column = 1
        ) as included_columns
    FROM
        sys.tables t
        INNER JOIN sys.indexes i ON t.object_id = i.object_id
    WHERE
        i.is_primary_key = 0 
        AND i.is_unique_constraint = 0
        AND i.type > 0
        AND i.is_unique = 0  -- Sadece normal indexler
    ORDER BY
        t.name, i.name;`;

    const uniqueIndexQuery = `
    SELECT
        t.name AS table_name,
        i.name AS index_name,
        i.type_desc AS index_type,
        i.is_unique,
        i.fill_factor,
        (
            SELECT STRING_AGG(c.name, ', ')
            FROM sys.index_columns ic
            JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            WHERE ic.object_id = i.object_id 
            AND ic.index_id = i.index_id
            AND ic.is_included_column = 0
        ) as key_columns,
        (
            SELECT STRING_AGG(c.name, ', ')
            FROM sys.index_columns ic
            JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            WHERE ic.object_id = i.object_id 
            AND ic.index_id = i.index_id
            AND ic.is_included_column = 1
        ) as included_columns
    FROM
        sys.tables t
        INNER JOIN sys.indexes i ON t.object_id = i.object_id
    WHERE
        i.is_primary_key = 0 
        AND i.is_unique_constraint = 0
        AND i.type > 0
        AND i.is_unique = 1  -- Sadece unique indexler
    ORDER BY
        t.name, i.name;`;

    const normalIndexResult = await execute(normalIndexQuery);
    for (const row of normalIndexResult.recordset) 
    {
        const tableName = `[${row.table_name}]`;
        const indexName = `[${row.index_name}]`;
        const keyColumns = row.key_columns ? row.key_columns.split(',').map(col => `[${col.trim()}]`).join(', ') : '';
        const includedColumns = row.included_columns ? row.included_columns.split(',').map(col => `[${col.trim()}]`).join(', ') : '';
        const fillFactor = row.fill_factor > 0 ? ` WITH (FILLFACTOR = ${row.fill_factor})` : '';
        const include = includedColumns ? ` INCLUDE (${includedColumns})` : '';

        scripts += `DROP INDEX IF EXISTS ${indexName} ON ${tableName};\nGO\n\n`;
        scripts += `CREATE INDEX ${indexName} ON ${tableName} (${keyColumns})${include}${fillFactor};\nGO\n\n`;
    }

    const uniqueIndexResult = await execute(uniqueIndexQuery);
    for (const row of uniqueIndexResult.recordset) 
    {
        const tableName = `[${row.table_name}]`;
        const indexName = `[${row.index_name}]`;
        const keyColumns = row.key_columns ? row.key_columns.split(',').map(col => `[${col.trim()}]`).join(', ') : '';
        const includedColumns = row.included_columns ? row.included_columns.split(',').map(col => `[${col.trim()}]`).join(', ') : '';
        const fillFactor = row.fill_factor > 0 ? ` WITH (FILLFACTOR = ${row.fill_factor})` : '';
        const include = includedColumns ? ` INCLUDE (${includedColumns})` : '';

        scripts += `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = '${row.index_name}' AND object_id = OBJECT_ID('${row.table_name}'))\n`;
        scripts += `BEGIN\n`;
        scripts += `    CREATE UNIQUE INDEX ${indexName} ON ${tableName} (${keyColumns})${include}${fillFactor};\n`;
        scripts += `END\nGO\n\n`;
    }

    const filePath = path.join(versionPath, versionFolder, 'db', 'I.sql');
    fs.writeFileSync(filePath, scripts);
    scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Index scripts generation completed' });
}
export async function generateScripts(versionFolder) 
{
    if (!versionFolder) 
    {
        scriptEvents.emit('error', { process: 'SQL-SCRIPT', message: 'Version folder argument is required!' });
        return;
    }

    scriptEvents.emit('start', { process: 'SQL-SCRIPT', message: `Starting script generation for version: ${versionFolder}` });
    
    try 
    {
        scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Directory structure checked' });
        ensureDirectoryExists(versionFolder);
        scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Database connection established' });

        await generateTableScripts(versionFolder);
        await generateVFPI(versionFolder);
        await generateIndex(versionFolder);
        
        scriptEvents.emit('complete', { process: 'SQL-SCRIPT', message: 'Script generation completed successfully' });
    } 
    catch (err) 
    {
        scriptEvents.emit('error', { process: 'SQL-SCRIPT', message: err.message });
        console.error('Error generating scripts:', err);
    } 
    finally 
    {
        scriptEvents.emit('progress', { process: 'SQL-SCRIPT', message: 'Database connection closed' });
    }
}

const isDirectRun = process.argv[1].includes('generate-scripts');

if (isDirectRun) 
{
    const versionFolder = process.argv[2];
    if (!versionFolder) 
    {
        process.exit(1);
    }
    
    console.log("Starting script generation for version:", versionFolder);
    generateScripts(versionFolder).then(() => console.log("Script generation completed"))
    .catch(err => 
    {
        console.error('Error:', err);
        process.exit(1);
    });
} 