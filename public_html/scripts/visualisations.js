window.onload = function () {
    update_colors(null)
    show_sections_on_start()
    // update_user_count_visit()
}

window.onresize = function () {
    // resize graphs canvas
    resize_canvas()
    for (var key in Chart.instances) {
        Chart.instances[key].options.scales.xAxis.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        Chart.instances[key].options.scales.yAxis.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        Chart.instances[key].update()
    }
}


function resize_canvas() {
    /* Change size of each canvas with graph */
    let ids = ['graph-balance', 'graph-operations', 'graph-transactions']
    ids.forEach(id => {
        c = document.getElementById(id)
        if (window.screen.width < 600) {
            c.width = window.innerWidth * 0.9
            c.height = c.width * (9 / 16)
        } else {
            c.width = window.innerWidth * 0.75
            c.height = c.width / 4
        }
    })
}

function show_sections_on_start() {
    SECTIONS_TO_SHOW_ON_UPLOAD.forEach(id => document.getElementById(id).style.display = 'none')
    SECTIONS_TO_HIDE_ON_UPLOAD.forEach(id => document.getElementById(id).style.removeProperty('display'))
}

function show_sections_on_upload() {
    SECTIONS_TO_SHOW_ON_UPLOAD.forEach(id => document.getElementById(id).style.removeProperty('display'))
    SECTIONS_TO_HIDE_ON_UPLOAD.forEach(id => document.getElementById(id).style.display = 'none')
}

function show_available_years(years) {
    /* Show fields to choose year */
    let section = document.getElementById('timeframe')
    section.style.display = 'visible'
    let form = section.getElementsByTagName('form')[0]
    form.innerHTML = ''
    years.forEach(year => {
        form.innerHTML += `<input
            type="radio"
            id="year_${year}"
            name="select_year"
            value="${year}"
            onclick="selected_year(event)"
            ${year == SELECT_ALL_YEARS ? "checked" : ""}>
        <label for="year_${year}">${year}</label>`
    })
}

function show_available_stocks(stocks) {
    /* Show fields to choose stock */
    let section = document.getElementById('stock-select')
    section.style.display = 'visible'
    let select = section.getElementsByTagName('select')[0]
    select.innerHTML = ''
    selected = ''
    stocks.forEach(stock => {
        if (selected === '') selected = stock
        select.innerHTML += `<option value='${stock}'>${stock}</option>`
    })
    SELECTED_STOCK = selected
}

function show_overall_stats(deposits, withdrawals, dividends, buys_nr, sells_nr,
                            profit_percent, profit_sum, profit_max, profit_avg,
                            loss_percent, loss_sum, loss_max, loss_avg,
                            profitloss_sum, profitloss_avg) {
    document.querySelector('#all-stats #stats-transfers-money-in .value').innerHTML = `${show_monetary_value(deposits)} zł`
    document.querySelector('#all-stats #stats-transfers-money-out .value').innerHTML = `${show_monetary_value(withdrawals)} zł`
    document.querySelector('#all-stats #stats-dividends-profit .value').innerHTML = `${show_monetary_value(dividends)} zł`
    document.querySelector('#all-stats #stats-stocks-buy-nr .value').innerHTML = buys_nr
    document.querySelector('#all-stats #stats-stocks-sell-nr .value').innerHTML = sells_nr
    document.querySelector('#all-stats #stats-stocks-percent-profit .value').innerHTML = `${profit_percent} %`
    document.querySelector('#all-stats #stats-stocks-profit .value').innerHTML = `${show_monetary_value(profit_sum)} zł`
    document.querySelector('#all-stats #stats-stocks-biggest-profit .value').innerHTML = `${show_monetary_value(profit_max)} zł`
    document.querySelector('#all-stats #stats-stocks-avg-profit .value').innerHTML = `${show_monetary_value(profit_avg)} zł`
    document.querySelector('#all-stats #stats-stocks-percent-loss .value').innerHTML = `${loss_percent} %`
    document.querySelector('#all-stats #stats-stocks-loss .value').innerHTML = `${show_monetary_value(loss_sum)} zł`
    document.querySelector('#all-stats #stats-stocks-biggest-loss .value').innerHTML = `${show_monetary_value(loss_max)} zł`
    document.querySelector('#all-stats #stats-stocks-avg-loss .value').innerHTML = `${show_monetary_value(loss_avg)} zł`
    document.querySelector('#all-stats #stats-stocks-overall-profit-loss .value').innerHTML = `${show_monetary_value(profitloss_sum)} zł`
    document.querySelector('#all-stats #stats-stocks-avg-profit-loss .value').innerHTML = `${show_monetary_value(profitloss_avg)} zł`
}

function show_taxes_dividends(dividends, dividends_taxes, withholding_taxes, difference) {
    try {
        document.querySelector('#taxes #dividends-all').innerHTML = `${show_monetary_value(dividends)} zł`
        document.querySelector('#taxes #dividends-tax').innerHTML = `${show_monetary_value(dividends_taxes)} zł`
        document.querySelector('#taxes #dividends-tax-taken').innerHTML = `${show_monetary_value(withholding_taxes)} zł`
        document.querySelector('#taxes #dividends-tax-left').innerHTML = `${show_monetary_value(difference)} zł`
        document.querySelector('#taxes #tax45').innerHTML = show_monetary_value(dividends_taxes)
        document.querySelector('#taxes #tax46').innerHTML = show_monetary_value(withholding_taxes)
        document.querySelector('#taxes #tax47').innerHTML = show_monetary_value(Math.ceil(difference))
        document.querySelector('#taxes #tax48').innerHTML = show_monetary_value(Math.ceil(difference))
    } catch {}
}

function show_taxes_stocks(income, cost, profit_by_country, not_found) {
    document.querySelector('#taxes #stocks-p').innerHTML = `${show_monetary_value(income)} zł`
    document.querySelector('#taxes #stocks-k').innerHTML = `${show_monetary_value(cost)} zł`
    document.querySelector('#taxes #tax22').innerHTML = show_monetary_value(income)
    document.querySelector('#taxes #tax23').innerHTML = show_monetary_value(cost)
    document.querySelector('#taxes #tax24').innerHTML = show_monetary_value(income)
    document.querySelector('#taxes #tax25').innerHTML = show_monetary_value(cost)
    if (income >= cost) {
        document.querySelector('#taxes #stocks-ds').innerHTML = `zysk wysokości <span>${show_monetary_value(income - cost)} zł</span>, 
            od którego należy zapłacić podatek 19% równy <span>${show_monetary_value((income - cost) * 0.19)}</span>`
        document.querySelector('#taxes #tax26').innerHTML = show_monetary_value(income - cost)
        document.querySelector('#taxes #tax27').innerHTML = ''
    } else {
        document.querySelector('#taxes #stocks-ds').innerHTML = `stratę wysokości <span>${show_monetary_value(income - cost)} zł</span>`
        document.querySelector('#taxes #tax26').innerHTML = ''
        document.querySelector('#taxes #tax27').innerHTML = show_monetary_value(cost - income)
    }

    let div = document.querySelector('#taxes > div:last-of-type > div:last-of-type')
    if (!div) return // coinbase doesn't have division by country
    div.innerHTML = ''
    for (let country in profit_by_country) {
        let profit = profit_by_country[country]
        if (profit > 0) {
            div.innerHTML += `<p>Łączny dochód otrzymany w <span>${country}</span> wyniósł <span>${show_monetary_value(profit)} zł</span>.</p>
                <div class='pit-38-g pit-zg-b'>
                    <div>B. DODATKOWE INFORMACJE</div>
                    <div>
                        <div><p class='nr'>6. Państwo uzyskania dochodu / przychodu</p><p class='tax' id='tax32'>${country}</p></div>
                        <div><p class='nr'>7. Kod kraju</p><p class='tax' id='tax33'></p></div>
                    </div>
                </div>

                <div class='pit-38-g'>
                    <div>C.3. DOCHODY I PODATEK ROZLICZANE W ZEZNANIU PODATKOWYM PIT-38</div>
                    <div>
                        <p>Dochód, o którym mowa w art. 30b ust. 5a i 5b ustawy</p>
                        <div><p class='nr'>32.</p><p class='tax' id='tax32'>${show_monetary_value(profit)}</p></div>
                        <p>Podatek zapłacony za granicą od dochodów z poz. 32</p>
                        <div><p class='nr'>33.</p><p class='tax' id='tax33'>${show_monetary_value(0.0)}</)p></div>
                        <p>Dochód, o którym mowa w art. 30b ust.5e i 5f ustawy</p>
                        <div><p class='nr'>34.</p><p class='tax'></p></div>
                        <p>Podatek zapłacony za granicą od dochodów z poz. 34</p>
                        <div><p class='nr'>35.</p><p class='tax'></p></div>
                    </div>
                </div>`
        }
    }
    if (Object.keys(not_found).length > 0) {
        let html = `<div class='error'>
            <p>Niestety poniższych akcji nie udało przypisać się do żadnego państwa.
            Sprawdź i dodaj je ręcznie przy wypełnianiu oświadczeń <span>PIT/ZG</span>.</p>`
        for (let key in not_found) {
            html += `<p>${key}: ${show_monetary_value(not_found[key])} zł dochodu</p>`
        }
        html += `</div>`
        div.innerHTML += html
    }
}

function show_details_of_stock(operations, buys, sells, profits,
                               profits_max, profits_min, profits_avg, profits_sum,
                               transactions) {
    let section = document.querySelector('#stock-detail-operations > div')
    section.innerHTML = ''

    if (operations && operations.length > 0) {
        document.getElementById('stock-select-name').innerHTML = operations[0].Name
        section.innerHTML = `<div>
                <div class='text'><p>Sprzedaż</p></div>
                <div class='starting-dot'>
                    <div class='dot'></div>
                    <div class='line'></div>
                </div>
                <div class='text'><p>Kupno</p></div>
            </div>`
        operations.forEach(d => {
            let price = show_monetary_value(d.TotalPLN)
            let price_per_share = show_monetary_value(d.TotalPLN / d.NumberOfShares)
            const empty_text = `<div class='text'><p></p></div>`
            const center_dot = `<div class='center-dot'>
                <div class='dot'></div>
                <div class='line-top'></div>
                <div class='line-bottom'></div>
                <div class='line-across'></div>
                <p>${d.Type == 'buy' ? '-' : '+'}<br/>${price}<br/>zł</p>
            </div>`
            const price_text = `<div class='text'><p>
                <strong>${d.NumberOfShares}</strong><br/>
                po ${price_per_share} zł<br/>za akcję
            </p></div>`

            if (d.Type == 'buy') {
                section.innerHTML += `<div class='buy'>${empty_text}${center_dot}${price_text}</div>`
            } else {
                section.innerHTML += `<div class='sell'>${price_text}${center_dot}${empty_text}</div>`
            }
        })
    }

    if (buys.length > 0 || sells.length > 0) {
        document.querySelector('#stock-detail-stats #stats-detail-buy-operations .value').innerHTML = buys.length
        document.querySelector('#stock-detail-stats #stats-detail-buy-actions .value').innerHTML = buys.reduce((prev, d) => prev + d.NumberOfShares, 0)
        document.querySelector('#stock-detail-stats #stats-detail-sell-operations .value').innerHTML = sells.length
        document.querySelector('#stock-detail-stats #stats-detail-sell-actions .value').innerHTML = sells.reduce((prev, d) => prev + d.NumberOfShares, 0)
    }

    if (profits.length > 0) {
        document.querySelector('#stock-detail-stats #stats-detail-transactions .value').innerHTML = profits.length
        document.querySelector('#stock-detail-stats #stats-detail-biggest-profit .value').innerHTML = `${show_monetary_value(profits_max)} zł`
        document.querySelector('#stock-detail-stats #stats-detail-biggest-loss .value').innerHTML = `${show_monetary_value(profits_min)} zł`
        document.querySelector('#stock-detail-stats #stats-detail-average-profit .value').innerHTML = `${show_monetary_value(profits_avg)} zł`
        document.querySelector('#stock-detail-stats #stats-detail-overall-profit-loss .value').innerHTML = `${show_monetary_value(profits_sum)} zł`
    }

    if (transactions.length > 0) {
        const h4 = document.querySelector('#stock-detail-table > h4')
        const table = document.querySelector('#stock-detail-table > div')
        if (window.screen.width < 1000) {
            h4.innerHTML = `Dane transakcji do skopiowania`
            table.innerHTML = `<div class='error'>Tabela dostepna tylko w widoku dla komputerów.</div>`
        } else {
            h4.innerHTML = `Dane transakcji do skopiowania <i class='icon-link-ext' onclick='copy_table(event)'></i>`
            let html = `<table>
                <tr>
                    <th colspan='3'>Kupno</th>
                    <th colspan='3'>Sprzedaż</th>
                    <th rowspan='2'>Ilość<br/>akcji</th>
                    <th rowspan='2'>Zysk/<br/>Strata</th>
                </tr>
                <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Cena (PLN)</th>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Cena (PLN)</th>
                </tr>`
            transactions.forEach(d => {
                html += `<tr>
                    <td>${d.BuyID}</td>
                    <td>${date_to_string(d.BuyTime, '.')}</td>
                    <td>${show_monetary_value(d.BuyPricePLN)}</td>
                    <td>${d.SellID}</td>
                    <td>${date_to_string(d.SellTime, '.')}</td>
                    <td>${show_monetary_value(d.SellPricePLN)}</td>
                    <td>${d.NumberOfShares}</td>
                    <td>${show_monetary_value(d.ProfitPLN)}</td>
                </tr>`
            })
            html += `</table>`
            table.innerHTML = html;
        }
    }
}