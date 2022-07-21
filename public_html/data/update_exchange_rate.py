#!/usr/bin/python3

import os
import json
import time
import numpy
import random
import requests
import datetime
from bs4 import BeautifulSoup


DIR = os.path.dirname(os.path.abspath(__file__))
RATES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'exchange_rates.js')
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'update_exchange_rate.log')


CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']
HOLIDAYS = [
    (1, 1),  # nowy rok
    (1, 6),  # trzech króli
    (5, 1),  # święto pracy
    (5, 3),  # rocznica uchwalenia konstytucji
    (11, 11),  # święto niepodległości
    (12, 25),  # boże narodzenie
    (12, 26),  # boże narodzenie
]


def log(date_key, text):
    if not text.endswith('\n'): text = text + '\n'
    date = datetime.datetime.strftime(datetime.datetime.now(), '%d.%m.%Y %H:%M:%S')
    with open(LOG_FILE, 'a+') as f:
        f.write(f'[{date} for key {date_key}] {text}')


def daterange(start, end):
    while start <= end:
        yield start
        start += datetime.timedelta(days=1)


def updateRatesLast():
    rates = {}
    with open(RATES_FILE, 'r') as f:
        rates = '{\n' + '\n'.join(f.read().split('\n')[1:])
        rates = json.loads(rates)
    # get latest date
    latest_date = datetime.datetime(2002, 1, 1)
    for c in CURRENCIES:
        for d in rates[c]:
            date = datetime.datetime.strptime(d, "%Y-%m-%d")
            if date > latest_date:
                latest_date = date
    print(latest_date)
    # get new rates
    start_date = latest_date + datetime.timedelta(days=1)
    end_date = datetime.datetime.now() - datetime.timedelta(days=1)
    days = list(daterange(start_date, end_date))
    if len(days) == 0:
        log('all', f'Found values already in all currencies, skipping update')
        return
    
    for date in days:
        date_key = f'{date.year}-{date.month:02}-{date.day:02}'
        holidays = [datetime.datetime(date.year, m, d) for (m, d) in HOLIDAYS]
        if date in holidays or date.weekday() in [5, 6]:
            log(date_key, 'Date is a weekend or holiday, skipping update')
            continue

        results = getRateOfDay(date)
        if len(results) == 0:
            log(date_key, 'Couldn\'t find courses')
            continue
        for (k, v) in results.items():
            rates[k][date_key] = v
        print(date_key, results)
    # save new rates
    time.sleep(5)
    with open(RATES_FILE, 'w+') as f:
        f.write('exchange_rates = ')
        json.dump(rates, f, indent=4)
    log(date_key, 'Updated courses')


def getRateOfDay(day):
    holidays = [f'{day.year}-{m:02}-{d:02}' for (m, d) in HOLIDAYS]
    n = 1 + numpy.busday_count(f'{day.year}-01-01',
                               f'{day.year}-{day.month:02}-{day.day:02}', weekmask='1111100', holidays=holidays)
    for i in list(range(n, n+3)) + list(range(n-1, n-10, -1)):
        url = f'https://www.nbp.pl/home.aspx?navid=archa&c=/ascx/tabarch.ascx&n=a{i:03}z{str(day.year)[-2:]}{day.month:02}{day.day:02}'
        page = requests.get(url)
        soup = BeautifulSoup(page.text, 'html.parser')
        table = soup.select('#article table tr')
        # if i == n: print(url)
        if len(table) <= 1:
            continue
        curr = {}
        for currency_name in CURRENCIES:
            currency = [i.text for i in table if currency_name.lower()
                        in i.text.lower()][-1]
            j = 4 if 'Waluta' in table[0].text else 3
            curr[currency_name] = currency.split('\n')[j]
        return curr
    return {}


def commit():
    date = datetime.datetime.now() - datetime.timedelta(days=1)
    date_key = f'{date.year}-{date.month:02}-{date.day:02}'
    # date_git = date_key + f"T{random.randint(0, 23):02}:{random.randint(0, 59):02}:{random.randint(0, 59):02}"
    cmd = f"cd {DIR} && "
    cmd += f"git add {RATES_FILE} {LOG_FILE} && "
    cmd += f"git commit -m 'exchange rates update on {date_key}' && "
    # cmd += f"GIT_AUTHOR_DATE={date_git} GIT_COMMITTER_DATE={date_git} git commit -m 'exchange rates update on {date_key}' && "
    cmd += "git push"
    os.system(cmd)


if __name__ == '__main__':
    updateRatesLast()
    commit()
