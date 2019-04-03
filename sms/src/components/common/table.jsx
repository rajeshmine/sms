import React from "react";
import TdsReactTable from 'tds-reacttablewrapper';
import styled from 'styled-components';

const Table = ({ ...props }) => {

    const columns = [
        {

        Header:"Name",
        HeaderValue:"Name",
        accessor:"userId",
        sortable:true,
        // filterable:true,
        show:true
       
    },
    {
        Header:"Entity",
        HeaderValue:"Entity",
        accessor:"entity",
        // filterable:true,
        sortable:true,
        // filterable:true,
        show:true
    },
    {
        Header:"Branch",
        HeaderValue:"Branch",
        accessor:"title",
        sortable:true,
        // filterable:true,
        show:true
    },
    {
        Header:"Department",
        HeaderValue:"Department",
        accessor:"body",
        sortable:true,
        // filterable:true,
        show:true
    },
    {
        Header:"Admin",
        HeaderValue:"Admin",
        accessor:"body",
        sortable:true,
        // filterable:true,
        show:true
    },
    {
        Header:"Staff",
        HeaderValue:"Staff",
        accessor:"body",
        sortable:true,
        // filterable:true,
        show:true
    },
    {
        Header:"Students",
        HeaderValue:"Students",
        accessor:"body",
        sortable:true,
        // filterable:true,
        show:true
    }
]
    return (
        
            <TdsReactTable
                            columns={columns}
                            data={props.data}
                            // showFilterToggler={false}
                            // showColumnChooser={false}
            />
      
    );
};

export default Table;