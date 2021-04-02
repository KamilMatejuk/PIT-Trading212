async function get_data_from_files() {
    /**
     * Retrieve data form csv files into list of dicts
     */
    let files = document.getElementById("tax-files").files;
    for (let i = 0; i < files.length; i++) {
        let allText = await files[i].text()
        var allTextLines = allText.split(/\r\n|\n/)
        let headers = []
        let currency = 'EUR'

        allTextLines.forEach(line => {
            if (line.toLowerCase().includes("isin")) {
                headers = line.split(',')
                currency = headers.filter(i => i.includes('Total ('))[0].split(/\(|\)/)[1]
                return
            }
            if (!headers.length) return
            if (line.length > 0) {
                line = line.split(',')
                type = line[headers.indexOf('Action')].toLowerCase()

                if (type.includes('buy')) {
                    operation = new OperationBuySellData()
                    operation.Type = 'buy'
                    operation.Comment = 'buy'
                    operation.Time = date_from_string(line[headers.indexOf('Time')])
                    operation.Ticker = line[headers.indexOf('Ticker')]
                    operation.Name = line[headers.indexOf('Name')].replaceAll('"', '')
                    operation.NumberOfShares = convert_value_to_float(line[headers.indexOf('No. of shares')])
                    operation.Total = convert_value_to_float(line[headers.indexOf(`Total (${currency})`)])
                    operation.TotalPLN = operation.convert_value_to_pln(operation.Total, currency)
                    operation.ID = line[headers.indexOf('ID')]
                    OPERATIONS_BUY_SELL.push(operation)
                }
                else if (type.includes('sell')) {
                    operation = new OperationBuySellData()
                    operation.Type = 'sell'
                    operation.Comment = 'sell'
                    operation.Time = date_from_string(line[headers.indexOf('Time')])
                    operation.Ticker = line[headers.indexOf('Ticker')]
                    operation.Name = line[headers.indexOf('Name')].replaceAll('"', '')
                    operation.NumberOfShares = convert_value_to_float(line[headers.indexOf('No. of shares')])
                    operation.Total = convert_value_to_float(line[headers.indexOf(`Total (${currency})`)])
                    operation.TotalPLN = operation.convert_value_to_pln(operation.Total, currency)
                    operation.ID = line[headers.indexOf('ID')]
                    OPERATIONS_BUY_SELL.push(operation)
                }
                else if (type.includes('deposit')) {
                    operation = new OperationDepositWithdrawalData()
                    operation.Type = 'deposit'
                    operation.Time = date_from_string(line[headers.indexOf('Time')])
                    operation.Total = convert_value_to_float(line[headers.indexOf(`Total (${currency})`)])
                    operation.TotalPLN = operation.convert_value_to_pln(operation.Total, currency)
                    operation.ID = line[headers.indexOf('ID')]
                    OPERATIONS_DEPOSIT_WITHDRAW.push(operation)
                }
                else if (type.includes('withdrawal')) {
                    operation = new OperationDepositWithdrawalData()
                    operation.Type = 'withdrawal'
                    operation.Time = date_from_string(line[headers.indexOf('Time')])
                    operation.Total = convert_value_to_float(line[headers.indexOf(`Total (${currency})`)])
                    operation.TotalPLN = operation.convert_value_to_pln(operation.Total, currency)
                    operation.ID = line[headers.indexOf('ID')]
                    OPERATIONS_DEPOSIT_WITHDRAW.push(operation)
                }
                else if (type.includes('dividend')) {
                    operation = new OperationDividendReceiveData()
                    operation.Time = date_from_string(line[headers.indexOf('Time')])
                    operation.Ticker = line[headers.indexOf('Ticker')]
                    operation.Name = line[headers.indexOf('Name')].replaceAll('"', '')
                    operation.NumberOfShares = convert_value_to_float(line[headers.indexOf('No. of shares')])
                    operation.Total = convert_value_to_float(line[headers.indexOf(`Total (${currency})`)])
                    operation.TotalPLN = operation.convert_value_to_pln(operation.Total, currency)
                    let tax = convert_value_to_float(line[headers.indexOf('Withholding tax')])
                    let tax_currency = line[headers.indexOf('Currency (Withholding tax)')]
                    operation.WithholdingTaxesPLN = operation.convert_value_to_pln(tax, tax_currency)
                    operation.ID = line[headers.indexOf('ID')]
                    OPERATIONS_DIVIDENDS.push(operation)
                }
                else {
                    console.log(`Unrecognized type ${line[headers.indexOf('Transaction Type')]}`)

                }

            }
        })
    }
    OPERATIONS_BUY_SELL.sort((a, b) => a.Time - b.Time)
    OPERATIONS_DEPOSIT_WITHDRAW.sort((a, b) => a.Time - b.Time)
    OPERATIONS_DIVIDENDS.sort((a, b) => a.Time - b.Time)
    console.log(OPERATIONS_BUY_SELL)
    console.log(OPERATIONS_DEPOSIT_WITHDRAW)
    console.log(OPERATIONS_DIVIDENDS)
}
