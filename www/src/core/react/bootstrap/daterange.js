import React from 'react';
import NbBase from './base.js';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';

export default class NbDateRange extends NbBase
{
    constructor(props)
    {
        super(props)

        this.state = 
        {
            startDate : this.props.startDate,
            endDate : this.props.endDate
        }
        this._onApply = this._onApply.bind(this)
    }
    get startDate()
    {
        return this.state.startDate
    }
    set startDate(e)
    {
        this.setState({startDate:e})
    }
    get endDate()
    {
        return this.state.endDate
    }
    set endDate(e)
    {
        this.setState({endDate:e})
    }
    _onApply()
    {
        if(typeof this.props.onApply != 'undefined')
        {
            this.props.onApply();
        }
    }
    render()
    {
        return(
            <DateRangePicker initialSettings={{ startDate: this.state.startDate, endDate: this.state.endDate, alwaysShowCalendars: true, locale: {
                format: 'DD/MM/YYYY'
              },            
            ranges:
            {
                [this.lang.t("dtToday")] : [moment(), moment()],
                [this.lang.t("tdLastDay")] : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                [this.lang.t("dtThisWeek")]  : [moment().startOf('week'), moment().endOf('week')],
                [this.lang.t("dtLastWeek")]  : [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
                [this.lang.t("dtMount")]  : [moment().startOf('month'), moment().endOf('month')],
                [this.lang.t("dtLastMount")]  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                [this.lang.t("dtYear")]  : [moment().startOf('year'), moment().endOf('year')],
                [this.lang.t("dtLastYear")]  : [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
            }}}
            onCallback={(start, end, label)=>
            {
                this.setState({startDate:start,endDate:end})
            }}
            onApply={this._onApply}
            >
                <input type="text" className="form-control" />
            </DateRangePicker>
        )
    }
}