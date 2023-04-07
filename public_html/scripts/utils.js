Array.prototype.filter_by_date = function (key = 'Time') {
    return this.filter(d => SELECTED_YEAR == SELECT_ALL_YEARS || d[key].getFullYear() == SELECTED_YEAR)
}

Array.prototype.deepcopy_custom_classes = function () {
    const result = []
    this.forEach(item => result.push(deepcopy_class(item)))
    return result
}

function convert_value_to_float(value) {
    if (value == '') return 0.0
    value = parseFloat(value)
    if (isNaN(value)) return 0.0
    return value
}

function date_from_string(datestr) {
    // "2020-09-22 13:22:07"
    let parts = datestr.split(/-|:| /).map(p => parseInt(p))
    parts[1]-- // months in notation 0-11
    return new Date(...parts)
}

function date_to_string(date, divider='-') {
    let year = date.getFullYear()
    let month = (date.getMonth() + 1).toString().padStart(2, '0')
    let day = date.getDate().toString().padStart(2, '0')
    key = `${year}${divider}${month}${divider}${day}`
    return key
}

function deepcopy_class(item) {
    return Object.assign(Object.create(Object.getPrototypeOf(item)), item)
}

function show_monetary_value(value) {
    if (value == 0) value_str = '0.00'
    digits = 2
    do {
        exp = 10 ** digits
        value_str = Number(Math.round(value * exp) / exp).toFixed(digits).toString()
        digits++
    } while (value != 0 && parseFloat(value_str) == 0)
    let k = 0
    let minus = value_str.includes('-')
    if (minus) value_str = value_str.replace('-', '')
    for (let i = 3; i < value_str.indexOf('.'); i += 3) {
        let j = value_str.indexOf('.') - i - k
        value_str = value_str.slice(0, j) + ' ' + value_str.slice(j)
        k++
    }
    return (minus ? '-' : '') + value_str.trim().replace(' ', '&nbsp;')
}

// function update_user_count_visit(event) {
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", new URL(`${BACKEND_URL}/users/visit`), false)
//     xhr.setRequestHeader("Content-Type", "application/json")
//     xhr.send(JSON.stringify({}))
// }

// function update_user_count_upload(event) {
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", new URL(`${BACKEND_URL}/users/upload`), false)
//     xhr.setRequestHeader("Content-Type", "application/json")
//     xhr.send(JSON.stringify({}))
// }
