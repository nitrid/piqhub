import React from 'react';
import Base from './base.js';
import PivotGrid,{FieldChooser,Export} from 'devextreme-react/pivot-grid';
import PivotGridDataSource from 'devextreme/ui/pivot_grid/data_source';

export {FieldChooser,Export}
export default class NdPivot extends Base
{
    constructor(props)
    {
        super(props)

        this.state = 
        {
            id : props.id,
            dataSource : props.dataSource,
            fields : props.fields,
            allowSortingBySummary : props.allowSortingBySummary,
            allowFiltering : props.allowFiltering,
            showBorders : props.showBorders,
            showColumnTotals : props.showColumnTotals,
            showColumnGrandTotals : props.showColumnGrandTotals,
            showRowTotals : props.showRowTotals,
            showRowGrandTotals : props.showRowGrandTotals,
        } 
    }
    setDataSource(pData,pField)
    {
        this.setState(
        {
            dataSource : new PivotGridDataSource(
                {
                    retrieveFields: false,
                    fields: typeof pField == 'undefined' ? this.state.fields : pField,
                    store:pData
                }
            )
        })
    }
    render()
    {
        return(
            <PivotGrid
            id={this.state.id}
            dataSource={this.state.dataSource}
            allowSortingBySummary={this.state.allowSortingBySummary}
            allowFiltering={this.state.allowFiltering}
            showBorders={this.state.showBorders}
            showColumnTotals={this.state.showColumnTotals}
            showColumnGrandTotals={this.state.showColumnGrandTotals}
            showRowTotals={this.state.showRowTotals}
            showRowGrandTotals={this.state.showRowGrandTotals}
            onCellPrepared={this.props.onCellPrepared}
            height={this.props.height}
            >
                {this.props.children}
            </PivotGrid>
        )
    }
}