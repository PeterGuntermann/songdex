const url = "data.csv";
const config = {
    method: 'get',
    headers: {
        'content-type': 'text/csv;charset=UTF-8',
    }
};

let rowData = [
    { make: "Toyota", model: "Celica", price: 35000 },
    { make: "Ford", model: "Mondeo", price: 32000 },
    { make: "Porsche", model: "Boxster", price: 72000 }
];
let columnDefs = [
    {field: "make"},
    {field: "model"},
    {field: "price"},
];
const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
}

document.addEventListener('DOMContentLoaded', () => {
    const songliste = document.querySelector('#songliste')
    console.log("gridOptions", gridOptions);
    new agGrid.Grid(songliste, gridOptions);
});

fetch(url, config)
    .then(res => res
        .text()
        .then(csvString => {
            const data = mapCsvStringToObjects(csvString)
            appendDataToTable(data)
            gridOptions.api.setRowData(rowData);
        }))

function mapCsvStringToObjects(csvString) {
    // TODO: implement or use CSV parser
    const data = Papa.parse(csvString)
    console.log(data.data);
    return data.data
}

function appendDataToTable(data) {
    // const songliste = document.getElementById("songliste")

    gridOptions.api.setRowData(data)

    // data.forEach(row => {
    //     const divNode = document.createElement("div")
    //     divNode.textContent = row
    //     songliste.appendChild(divNode)
    // })
}

