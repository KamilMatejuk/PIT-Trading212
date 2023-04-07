class OperationData {
    constructor() {
        this.Time = null
        this.Comment = ''
    }

    convert_value_to_pln(value, currency) {
        let currencies = {
            'EUR': exchange_rates['EUR'],
            'USD': exchange_rates['USD'],
            'GBX': exchange_rates['GBP'],
            'GBP': exchange_rates['GBP'],
            'CHF': exchange_rates['CHF'],
        }
        let rate = this.get_last_rate(currencies[currency.toUpperCase()])
        return convert_value_to_float(value) * rate
    }

    get_last_rate(rates) {
        let date = date_to_string(this.Time)
        if (rates.hasOwnProperty(date)) return rates[date]
        let d = new Date(this.Time.getTime());
        // check last 2 weeks
        for (let i = 0; i < 14; i++) {
            d.setDate(d.getDate() - 1) // prev day
            let year = d.getFullYear()
            let month = (d.getMonth() + 1).toString().padStart(2, '0')
            let day = d.getDate().toString().padStart(2, '0')
            key = `${year}-${month}-${day}`
            if (rates.hasOwnProperty(key)) return rates[key]
        }
    }
}

class OperationDividendReceiveData extends OperationData {
    constructor() {
        super()
        this.Ticker = null
        this.Name = null
        this.NumberOfShares = null
        this.Total = null
        this.TotalPLN = null
        this.ID = null
        this.WithholdingTaxesPLN = null
    }
}

class OperationBuySellData extends OperationData {
    constructor() {
        super()
        this.Type = null // 'buy' 'sell'
        this.Ticker = null
        this.Name = null
        this.NumberOfShares = null
        this.Total = null
        this.TotalPLN = null
        this.ID = null
    }
    
}

class OperationDepositWithdrawalData extends OperationData {
    constructor() {
        super()
        this.Type = null // 'deposit' 'withdrawal'
        this.Total = null
        this.TotalPLN = null
        this.ID = null
    }
}

class TransactionData {
    constructor(buy, sell, shares) {
        this.Ticker = buy.Ticker
        this.Name = buy.Name
        this.NumberOfShares = shares
        // buy
        this.BuyID = buy.ID
        this.BuyTime = buy.Time
        this.BuyPricePLN = buy.TotalPLN * shares / buy.NumberOfShares
        // sell
        this.SellID = sell.ID
        this.SellTime = sell.Time
        this.SellPricePLN = sell.TotalPLN * shares / sell.NumberOfShares
        // profit
        this.ProfitPLN = this.SellPricePLN - this.BuyPricePLN
    }
}
