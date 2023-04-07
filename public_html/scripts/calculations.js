async function start_workload() {
    await get_data_from_files()
    show_sections_on_upload()
    get_available_years()
    resize_canvas()
    year_dependant_actions()
    resize_canvas()
    window.scrollTo(0, 0)
    // update_user_count_upload()
}

function get_available_years() {
    /* Show fields to choose year */
    let years = new Set(OPERATIONS_BUY_SELL.map(d => d.Time.getFullYear()))
    years.add(SELECT_ALL_YEARS)
    years = Array.from(years).sort()
    show_available_years(years)
}
function selected_year(event) {
    /* Onclick when selecting yeae */
    SELECTED_YEAR = parseInt(event.target.value)
    if (isNaN(SELECTED_YEAR)) {
        SELECTED_YEAR = SELECT_ALL_YEARS
    }
    year_dependant_actions()
}

function year_dependant_actions() {
    /* Actions to be recalculated when year is changed */
    for (var key in Chart.instances) {
        Chart.instances[key].destroy()
    }
    divide_to_actions()
    console.log(OPERATIONS_BUY_SELL_BY_TICKER)
    divide_to_transactions()
    console.log(OPERATIONS_BUY_SELL_IN_TRANSACTIONS)
    get_available_stocks()
    get_overall_stats()
    draw_stock_graphs()
    get_taxes_dividends()
    get_taxes_stocks()
    stock_dependant_actions()
}

function stock_dependant_actions() {
    /* Actions to be recalculated when stock is changed */
    get_details_of_stock()
}

function get_available_stocks() {
    /* Show fields to choose stock */
    let stocks = new Set(OPERATIONS_BUY_SELL.filter_by_date().map(d => d.Ticker).sort())
    show_available_stocks(stocks)
}
function selected_stock(event) {
    SELECTED_STOCK = event.target.value
    stock_dependant_actions()
}

function get_overall_stats() {
    // deposits
    let deposits = OPERATIONS_DEPOSIT_WITHDRAW
        .filter_by_date()
        .filter(d => d.Type == 'deposit')
        .reduce((prev, d) => prev + d.TotalPLN, 0)
    // withdrawals
    let withdrawals = OPERATIONS_DEPOSIT_WITHDRAW
        .filter_by_date()
        .filter(d => d.Type == 'withdrawal')
        .reduce((prev, d) => prev + d.TotalPLN, 0)
    // dividends
    let dividends = OPERATIONS_DIVIDENDS
        .filter_by_date()
        .reduce((prev, d) => prev + d.TotalPLN, 0)
    // stocks
    let buys = OPERATIONS_BUY_SELL
        .filter_by_date()
        .filter(d => d.Type == 'buy')
    let sells = OPERATIONS_BUY_SELL
        .filter_by_date()
        .filter(d => d.Type == 'sell')
    
    let profitloss = []
    for (let key in OPERATIONS_BUY_SELL_IN_TRANSACTIONS) {
        let transactions_dict = {}
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].forEach(d => {
            if (!transactions_dict.hasOwnProperty(d.SellID)) transactions_dict[d.SellID] = []
            transactions_dict[d.SellID].push(d)
        })
        for (let key in transactions_dict) {
            let buy = transactions_dict[key].reduce((prev, d) => prev + d.BuyPricePLN, 0)
            let sell = transactions_dict[key].reduce((prev, d) => prev + d.SellPricePLN, 0)
            profitloss.push(sell - buy)
        }
    }
    let profit = profitloss.filter(d => d >= 0)
    let loss = profitloss.filter(d => d < 0)

    let profit_percent = profitloss.length == 0 ? 0 : Math.round(100 * profit.length / profitloss.length)
    let profit_sum = profit.reduce((prev, d) => prev + d, 0)
    let profit_max = Math.max(...profit, 0)
    let profit_avg = profit.length == 0 ? 0 : profit_sum / profit.length

    let loss_percent = profitloss.length == 0 ? 0 : Math.round(100 * loss.length / profitloss.length)
    let loss_sum = loss.reduce((prev, d) => prev + d, 0)
    let loss_max = Math.min(...loss, 0)
    let loss_avg = loss.length == 0 ? 0 : loss_sum / loss.length

    let profitloss_sum = profitloss.reduce((prev, d) => prev + d, 0)
    let profitloss_avg = profitloss.length == 0 ? 0 : profitloss_sum / profitloss.length
    show_overall_stats(deposits, withdrawals, dividends, buys.length, sells.length,
        profit_percent, profit_sum, profit_max, profit_avg,
        loss_percent, loss_sum, loss_max, loss_avg,
        profitloss_sum, profitloss_avg)
}

function draw_stock_graphs() {
    let account = {}
    let min_year = new Date().getFullYear()
    let max_year = new Date(1970, 0, 1).getFullYear()
    // deposits
    OPERATIONS_DEPOSIT_WITHDRAW
        .filter_by_date()
        .filter(d => d.Type == 'deposit')
        .forEach(d => {
            let year = d.Time.getFullYear()
            let month = d.Time.getMonth()
            min_year = Math.min(min_year, year)
            max_year = Math.max(max_year, year)
            let key = new Date(year, month)
            if (!account.hasOwnProperty(key)) account[key] = 0
            account[key] += d.TotalPLN
        })
    // withdrawals
    OPERATIONS_DEPOSIT_WITHDRAW
        .filter_by_date()
        .filter(d => d.Type == 'withdrawal')
        .forEach(d => {
            let year = d.Time.getFullYear()
            let month = d.Time.getMonth()
            min_year = Math.min(min_year, year)
            max_year = Math.max(max_year, year)
            let key = new Date(year, month)
            if (!account.hasOwnProperty(key)) account[key] = 0
            account[key] -= d.TotalPLN
        })
    // dividends
    OPERATIONS_DIVIDENDS
        .filter_by_date()
        .forEach(d => {
            let year = d.Time.getFullYear()
            let month = d.Time.getMonth()
            min_year = Math.min(min_year, year)
            max_year = Math.max(max_year, year)
            let key = new Date(year, month)
            if (!account.hasOwnProperty(key)) account[key] = 0
            account[key] += d.TotalPLN
        })
    // stocks
    for (let key in OPERATIONS_BUY_SELL_IN_TRANSACTIONS) {
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].forEach(d => {
            let year = d.SellTime.getFullYear()
            let month = d.SellTime.getMonth()
            min_year = Math.min(min_year, year)
            max_year = Math.max(max_year, year)
            let key = new Date(year, month)
            if (!account.hasOwnProperty(key)) account[key] = 0
            account[key] += d.ProfitPLN
        })
    }
    let keys = Object.keys(account).sort((a, b) => new Date(a) - new Date(b))
    for (let i = 1; i < keys.length; i++) {
        account[keys[i]] += account[keys[i - 1]]
    }
    
    let buys = OPERATIONS_BUY_SELL
    .filter_by_date()
    .filter(d => d.Type == 'buy')
    let sells = OPERATIONS_BUY_SELL
    .filter_by_date()
    .filter(d => d.Type == 'sell')
    
    let operations = {}
    buys.concat(sells).forEach(o => {
        let year = o.Time.getFullYear()
        let month = o.Time.getMonth()
        min_year = Math.min(min_year, year)
        max_year = Math.max(max_year, year)
        let key = new Date(year, month)
        if (!operations.hasOwnProperty(key)) operations[key] = 0
        operations[key]++
    })
    
    let transactions_profit = {}
    let transactions_loss = {}
    for (let key in OPERATIONS_BUY_SELL_IN_TRANSACTIONS) {
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].forEach(d => {
            let year = d.SellTime.getFullYear()
            let month = d.SellTime.getMonth()
            min_year = Math.min(min_year, year)
            max_year = Math.max(max_year, year)
            let key = new Date(year, month)
            if (d.ProfitPLN >= 0) {
                if (!transactions_profit.hasOwnProperty(key)) transactions_profit[key] = 0
                transactions_profit[key]++
            } else {
                if (!transactions_loss.hasOwnProperty(key)) transactions_loss[key] = 0
                transactions_loss[key]--
            }
        })
    }


    for (let year = min_year; year <= max_year; year++) {
        for (let month = 0; month <= 11; month++) {
            let key = new Date(year, month)
            if (!account.hasOwnProperty(key)) account[key] = 0
            if (!operations.hasOwnProperty(key)) operations[key] = 0
            if (!transactions_profit.hasOwnProperty(key)) transactions_profit[key] = 0
            if (!transactions_loss.hasOwnProperty(key)) transactions_loss[key] = 0
        }
    }

    draw_line_chart('graph-balance', account)
    draw_line_chart('graph-operations', operations)
    draw_double_bar_chart('graph-transactions', transactions_profit, transactions_loss)
    resize_canvas()
}

function divide_to_actions() {
    /* Divide actions into different tickers */
    OPERATIONS_BUY_SELL_BY_TICKER = {}
    OPERATIONS_BUY_SELL.forEach(d => {
            let key = d.Ticker
            if (!OPERATIONS_BUY_SELL_BY_TICKER.hasOwnProperty(key)) {
                OPERATIONS_BUY_SELL_BY_TICKER[key] = []
            }
            OPERATIONS_BUY_SELL_BY_TICKER[key].push(d)
        })
    for (key in OPERATIONS_BUY_SELL_BY_TICKER) {
        OPERATIONS_BUY_SELL_BY_TICKER[key].sort((a, b) => a.Time - b.Time)
    }
}

function divide_to_transactions() {
    /* Divide actions for particular ticker into different transactions */
    for (let key in OPERATIONS_BUY_SELL_BY_TICKER) {
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key] = []
        let buys = OPERATIONS_BUY_SELL_BY_TICKER[key].filter(d => d.Type == 'buy').deepcopy_custom_classes()
        let sells = OPERATIONS_BUY_SELL_BY_TICKER[key].filter(d => d.Type == 'sell').deepcopy_custom_classes()

        while (sells.length > 0) {
            const sell = sells[0]
            const buy = buys[0]
            if (!sell) break // zostały kupna, jeszcze nie sprzedane
            if (!buy) break // error - zostały sprzedaże, ale nie ma z czego sprzedawać
            let shares = parseFloat(buy.NumberOfShares)
            if (!buy.SharesLeft) buy.SharesLeft = buy.NumberOfShares
            if (!sell.SharesLeft) sell.SharesLeft = sell.NumberOfShares

            if (sell.SharesLeft == buy.SharesLeft) {
                shares = parseFloat(buy.SharesLeft)
                sells.shift()
                buys.shift()
            } else if (sell.SharesLeft > buy.SharesLeft) {
                shares = buy.SharesLeft
                buys.shift()
                sells[0].SharesLeft = sell.SharesLeft - shares
            } else if (sell.SharesLeft < buy.SharesLeft) {
                shares = sell.SharesLeft
                sells.shift()
                buys[0].SharesLeft = buy.SharesLeft - shares
            }
            OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].push(new TransactionData(buy, sell, shares))
        }
    }
    for (let key in OPERATIONS_BUY_SELL_IN_TRANSACTIONS) {
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key] = OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].filter_by_date('SellTime')
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].sort((a, b) => a.SellTime - b.SellTime)
    }
}

function get_details_of_stock() {
    /* Fill data about specific stock */
    operations = []
    if (OPERATIONS_BUY_SELL_BY_TICKER.hasOwnProperty(SELECTED_STOCK)) {
        operations = OPERATIONS_BUY_SELL_BY_TICKER[SELECTED_STOCK].filter_by_date()
    }
    
    buys = []
    sells = []
    if (OPERATIONS_BUY_SELL_BY_TICKER.hasOwnProperty(SELECTED_STOCK)) {
        buys = OPERATIONS_BUY_SELL_BY_TICKER[SELECTED_STOCK]
            .filter_by_date()
            .filter(d => d.Type == 'buy')
        sells = OPERATIONS_BUY_SELL_BY_TICKER[SELECTED_STOCK]
            .filter_by_date()
            .filter(d => d.Type == 'sell')
    }

    profits = []
    profits_max = 0
    profits_min = 0
    profits_avg = 0
    profits_sum = 0
    if (OPERATIONS_BUY_SELL_IN_TRANSACTIONS.hasOwnProperty(SELECTED_STOCK)) {
        let transactions_dict = {}
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[SELECTED_STOCK].forEach(d => {
            if (!transactions_dict.hasOwnProperty(d.SellID)) transactions_dict[d.SellID] = []
            transactions_dict[d.SellID].push(d)
        })
        for (let key in transactions_dict) {
            let buy = transactions_dict[key].reduce((prev, d) => prev + d.BuyPricePLN, 0)
            let sell = transactions_dict[key].reduce((prev, d) => prev + d.SellPricePLN, 0)
            profits.push(sell - buy)
        }
        profits_max = Math.max(...profits, 0)
        profits_min = Math.min(...profits, 0)
        profits_sum = profits.reduce((prev, d) => prev + d, 0)
        profits_avg = profits.length == 0 ? 0 : profits_sum / profits.length
    }

    transactions = []
    if (OPERATIONS_BUY_SELL_IN_TRANSACTIONS.hasOwnProperty(SELECTED_STOCK)) {
        transactions = OPERATIONS_BUY_SELL_IN_TRANSACTIONS[SELECTED_STOCK]
    }

    show_details_of_stock(operations, buys, sells, profits, profits_max, profits_min, profits_avg, profits_sum, transactions)
}

function copy_table(event) {
    let text = 'ID kupna, Data kupna, Cena kupna PLN, ID sprzedaży, Data sprzedaży, Cena sprzedaży PLN, Ilość akcji, Zysk PLN,\n'
    OPERATIONS_BUY_SELL_IN_TRANSACTIONS[SELECTED_STOCK].forEach(d => {
        text += `${d.BuyID}, ${date_to_string(d.BuyTime, '.')}, ${show_monetary_value(d.BuyPricePLN)},`
        text += `${d.SellID}, ${date_to_string(d.SellTime, '.')}, ${show_monetary_value(d.SellPricePLN)},`
        text += `${d.NumberOfShares}, ${show_monetary_value(d.ProfitPLN)},\n`
    })
    navigator.clipboard.writeText(text)
    alert('Skopiowano dane do schowka.\nMożesz je wkleić używając skrótu Ctrl + V.')
}

function get_taxes_dividends() {
    /* Fill taxes data about dividends */
    let dividends = OPERATIONS_DIVIDENDS
        .filter_by_date()
        .reduce((prev, d) => prev + d.TotalPLN, 0)
    let withholding_taxes = OPERATIONS_DIVIDENDS
        .filter_by_date()
        .reduce((prev, d) => prev + d.WithholdingTaxesPLN, 0)
    let d1 = dividends * 0.19
    let d2 = d1 - withholding_taxes
    show_taxes_dividends(dividends, d1, withholding_taxes, d2)
}

function get_taxes_stocks() {
    let income = 0
    let cost = 0
    for (let key in OPERATIONS_BUY_SELL_IN_TRANSACTIONS) {
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].forEach(d => {
            income += d.SellPricePLN
            cost += d.BuyPricePLN
        })
    }    

    // income_by_country = {}
    // cost_by_country = {}
    profit_by_country = {}
    not_found = {}
    for (let key in OPERATIONS_BUY_SELL_IN_TRANSACTIONS) {
        OPERATIONS_BUY_SELL_IN_TRANSACTIONS[key].forEach(d => {
            country = stocks_countries[d.Ticker]
            if (country) {
                // if (!income_by_country.hasOwnProperty(country)) income_by_country[country] = 0
                // if (!cost_by_country.hasOwnProperty(country))   cost_by_country[country] = 0
                if (!profit_by_country.hasOwnProperty(country)) profit_by_country[country] = 0
                // income_by_country[country] += d.SellPricePLN
                // cost_by_country[country]   += d.BuyPricePLN
                profit_by_country[country] += d.ProfitPLN
            } else {
                if (!not_found.hasOwnProperty(d.Ticker)) not_found[d.Ticker] = 0
                not_found[d.Ticker] += d.ProfitPLN
            }
        })
    }
    // console.log('income_by_country', income_by_country)
    // console.log('cost_by_country', cost_by_country)
    // console.log('profit_by_country', profit_by_country)
    show_taxes_stocks(income, cost, profit_by_country, not_found)
}
