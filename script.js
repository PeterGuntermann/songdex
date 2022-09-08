const url = "data.csv";
const config = {
    method: 'get',
    headers: {
        'content-type': 'text/csv;charset=UTF-8',
    }
};

fetch(url, config)
    .then(res => res
        .text()
        .then(csvString => {
            const data = mapCsvStringToObjects(csvString)
            appendDataToTable(data)
        }))

function mapCsvStringToObjects(csvString) {
    // TODO: implement or use CSV parser
    const data = Papa.parse(csvString)
    console.log(data.data);
    return data.data
}

function appendDataToTable(data) {
    const songliste = document.getElementById("songliste")
    data.forEach(row => {
        const divNode = document.createElement("div")
        divNode.textContent = row
        songliste.appendChild(divNode)
    })
}

