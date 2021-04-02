// time select
const SELECT_ALL_YEARS = 'Całość'
let SELECTED_YEAR = SELECT_ALL_YEARS
let SELECTED_STOCK = ''

// read data
let OPERATIONS_DIVIDENDS = []
let OPERATIONS_BUY_SELL = []
let OPERATIONS_DEPOSIT_WITHDRAW = []

// divide by ticker
let OPERATIONS_BUY_SELL_BY_TICKER = {}

// group into transactions
let OPERATIONS_BUY_SELL_IN_TRANSACTIONS = {}

// sections
const SECTIONS_TO_HIDE_ON_UPLOAD = ['upload', 'faq']
const SECTIONS_TO_SHOW_ON_UPLOAD = ['timeframe',
                                    'all-stats',
                                    'all-graphs',
                                    'stock-select',
                                    'stock-detail-operations',
                                    'stock-detail-stats',
                                    'stock-detail-table',
                                    'taxes',
                                    'contact']

// others
APP_VERSION = '2.0.0'
BACKEND_URL =  'http://127.0.0.1:5001'
