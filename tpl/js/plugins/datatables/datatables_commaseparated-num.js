$.extend( $.fn.dataTableExt.oSort, {
    "commaseparated-num-pre": function ( a ) {
        a = a.replace(/,/g, "" );
        return parseFloat( a );
    },
 
    "commaseparated-num-asc": function ( a, b ) {
        return a - b;
    },
 
    "commaseparated-num-desc": function ( a, b ) {
        return b - a;
    }
} );