const OPTIONS = {
    'animation': false,
    'spanGaps': true,
    'tension': 0.1,
    'elements': {
        'point': {
            'radius': 0
        }
    },
    'plugins': {
        'legend': {
            'display': false,
        }
    },
    'scales': {
        'xAxis': {
            'ticks': {
                'color': getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                'maxRotation': 0,
                'align': 'start',
                'autoSkipPadding': 15,
            },
            'grid': {
                'display': false,
            },
            'stacked': true
        },
        'yAxis': {
            'ticks': {
                'color': getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                'count': 5,
            },
            'grid': {
                'display': true,
            },
            'stacked': true
        }
    }
}

function draw_line_chart(canvas_id, data) {
    let data_points = []
    let labels = []
    Object.keys(data).map(k => new Date(k)).sort((a, b) => a - b).forEach(key => {
        let year = new Date(key).getFullYear()
        let month = (new Date(key).getMonth() + 1).toString().padStart(2, '0')
        labels.push(`${month}.${year}r`)
        data_points.push(data[key])
    })
    let accent_color = getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
    return new Chart(
        document.getElementById(canvas_id).getContext('2d'),
        {
            'type': 'line',
            'data': {
                'labels': labels,
                'datasets': [{
                    'data': data_points,
                    'color': accent_color,
                    'borderColor': accent_color,
                    'backgroundColor': accent_color
                }]
            },
            'options': OPTIONS
        });
}

function draw_single_bar_chart(canvas_id, data) {
    let data_points = []
    let labels = []
    Object.keys(data).map(k => new Date(k)).sort((a, b) => a - b).forEach(key => {
        let year = new Date(key).getFullYear()
        let month = (new Date(key).getMonth() + 1).toString().padStart(2, '0')
        labels.push(`${month}.${year}r`)
        data_points.push(data[key])
    })
    let accent_color = getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
    return new Chart(
        document.getElementById(canvas_id).getContext('2d'),
        {
            'type': 'bar',
            'data': {
                'labels': labels,
                'datasets': [{
                    'data': data_points,
                    'color': accent_color,
                    'borderColor': accent_color,
                    'backgroundColor': accent_color
                }]
            },
            'options': OPTIONS
        });
}

function draw_double_bar_chart(canvas_id, positive_data, negative_data) {
    let positive_data_points = []
    let negative_data_points = []
    let labels = []
    Object.keys(positive_data).map(k => new Date(k)).sort((a, b) => a - b).forEach(key => {
        let year = new Date(key).getFullYear()
        let month = (new Date(key).getMonth() + 1).toString().padStart(2, '0')
        labels.push(`${month}.${year}r`)
    })
    Object.keys(positive_data).map(k => new Date(k)).sort((a, b) => a - b).forEach(key => {
        positive_data_points.push(positive_data[key])
    })
    Object.keys(negative_data).map(k => new Date(k)).sort((a, b) => a - b).forEach(key => {
        negative_data_points.push(negative_data[key])
    })
    let green_color = getComputedStyle(document.documentElement).getPropertyValue('--green')
    let red_color = getComputedStyle(document.documentElement).getPropertyValue('--red')
    return new Chart(
        document.getElementById(canvas_id).getContext('2d'),
        {
            'type': 'bar',
            'data': {
                'labels': labels,
                'datasets': [{
                    'data': positive_data_points,
                    'color': green_color,
                    'borderColor': green_color,
                    'backgroundColor': green_color
                }, {
                    'data': negative_data_points,
                    'color': red_color,
                    'borderColor': red_color,
                    'backgroundColor': red_color
                }]
            },
            'options': OPTIONS
        });
}