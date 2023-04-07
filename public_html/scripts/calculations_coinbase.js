async function get_data_from_files() {
    /**
     * Retrieve data form csv files into list of dicts
     */
    let files = document.getElementById("tax-files").files;
    for (let i = 0; i < files.length; i++) {
        let allText = await files[i].text()
        var allTextLines = allText.split(/\r\n|\n/)
        let headers = []

        allTextLines.forEach(line => {
            if (line.toLowerCase().includes("timestamp")) {
                headers = line.split(',')
                return
            }
            if (!headers.length) return
            if (line.length > 0) {
                line = line.split(',')
                type = line[headers.indexOf('Transaction Type')]

                switch (type) {
                    case 'Receive':
                    case 'Coinbase Earn':
                        operation = new OperationBuySellData()
                        operation.Type = 'buy'
                        operation.Comment = 'receive'
                        operation.Time = new Date(line[headers.indexOf('Timestamp')])
                        operation.Ticker = line[headers.indexOf('Asset')]
                        operation.Name = line[headers.indexOf('Asset')]
                        operation.NumberOfShares = convert_value_to_float(line[headers.indexOf('Quantity Transacted')])
                        operation.Total = 0.0
                        operation.TotalPLN = 0.0
                        OPERATIONS_BUY_SELL.push(operation)
                        break
                    
                    case 'Buy':
                        operation = new OperationBuySellData()
                        operation.Type = 'buy'
                        operation.Comment = 'buy'
                        operation.Time = new Date(line[headers.indexOf('Timestamp')])
                        operation.Ticker = line[headers.indexOf('Asset')]
                        operation.Name = line[headers.indexOf('Asset')]
                        operation.NumberOfShares = convert_value_to_float(line[headers.indexOf('Quantity Transacted')])
                        operation.Total = convert_value_to_float(line[headers.indexOf('Total (inclusive of fees)')])
                        operation.TotalPLN = operation.convert_value_to_pln(operation.Total, line[headers.indexOf('Spot Price Currency')])
                        OPERATIONS_BUY_SELL.push(operation)
                        break
                    
                    case 'Sell':
                        operation = new OperationBuySellData()
                        operation.Type = 'sell'
                        operation.Comment = 'sell'
                        operation.Time = new Date(line[headers.indexOf('Timestamp')])
                        operation.Ticker = line[headers.indexOf('Asset')]
                        operation.Name = line[headers.indexOf('Asset')]
                        operation.NumberOfShares = convert_value_to_float(line[headers.indexOf('Quantity Transacted')])
                        operation.Total = convert_value_to_float(line[headers.indexOf('Total (inclusive of fees)')])
                        operation.TotalPLN = operation.convert_value_to_pln(operation.Total, line[headers.indexOf('Spot Price Currency')])
                        OPERATIONS_BUY_SELL.push(operation)
                        break
                    
                    case 'Convert':
                        /*
                        ************************************************** coinbase:
                        Timestamp                    2021-08-27T16:46:14Z
                        Transaction Type             Convert
                        Asset                        BTC
                        Quantity Transacted          0.00035457
                        Spot Price Currency          EUR
                        Spot Price at Transaction    187269.09
                        Subtotal                     65.70
                        Total (inclusive of fees)    66.40
                        Fees                         0.700000
                        Notes                        Converted 0.00035457 BTC to 0.00522565 ETH
                        
                        ************************************************** coin tracker:
                        Date                         08/27/2021 16:46:13
                        Type                         Trade
                        Transaction ID
                        Received Quantity            0.00522565
                        Received Currency            ETH
                        Received Currency Balance    0.00522565
                        Received Cost Basis (PLN)    65.72
                        Received Wallet              Coinbase - ETH Wallet
                        Received Address
                        Received Tag
                        Received Comment             Converted to Ethereum Using BTC Wallet
                        Sent Quantity                0.00035457
                        Sent Currency                BTC
                        Sent Currency Balance        0.00035455
                        Sent Cost Basis (PLN)        14.88
                        Sent Wallet                  Coinbase - BTC Wallet
                        Sent Address
                        Sent Tag
                        Sent Comment                 Converted to Ethereum Using BTC Wallet
                        Fee Amount
                        Fee Currency
                        Realized Return (PLN)        50.83
                        */
                        
                        let notes = line[headers.indexOf('Notes')]
                        if (notes[0] == '"') notes = line.slice(headers.indexOf('Notes')).join().replaceAll(/\"|,/g, '')
                        notes = notes.split(' ')
                        
                        operation = new OperationBuySellData()
                        operation.Type = 'sell'
                        operation.Comment = 'sell'
                        operation.Time = new Date(line[headers.indexOf('Timestamp')])
                        operation.Ticker = notes[2]
                        operation.Name = notes[2]
                        operation.NumberOfShares = convert_value_to_float(notes[1])
                        operation.Total = convert_value_to_float(line[headers.indexOf('Total (inclusive of fees)')])
                        operation.TotalPLN = operation.convert_value_to_pln(operation.Total, line[headers.indexOf('Spot Price Currency')])
                        OPERATIONS_BUY_SELL.push(operation)
                        
                        operation = new OperationBuySellData()
                        operation.Type = 'buy'
                        operation.Comment = 'buy'
                        operation.Time = new Date(line[headers.indexOf('Timestamp')])
                        operation.Ticker = notes[5]
                        operation.Name = notes[5]
                        operation.NumberOfShares = convert_value_to_float(notes[4])
                        operation.Total = convert_value_to_float(line[headers.indexOf('Subtotal')])
                        operation.TotalPLN = operation.convert_value_to_pln(operation.Total, line[headers.indexOf('Spot Price Currency')])
                        OPERATIONS_BUY_SELL.push(operation)

                        break
                    
                    default:
                        console.log(`Unrecognized type ${line[headers.indexOf('Transaction Type')]}`)
                        return

                }

            }
        })
    }
    OPERATIONS_BUY_SELL.sort((a, b) => a.Time - b.Time)
    console.log(OPERATIONS_BUY_SELL)
}
