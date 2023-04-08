#!/usr/bin/python3

import os
import json
import time
import numpy
import random
import requests
import datetime
import pandas as pd


DIR = os.path.dirname(os.path.abspath(__file__))
RATES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'exchange_rates.js')
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'update_exchange_rate.log')
DOWNLOAD = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'download.csv')


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


def get_latest_date():
    rates = {}
    if os.path.exists(RATES_FILE):
        with open(RATES_FILE, 'r') as f:
            rates = '{\n' + '\n'.join(f.read().split('\n')[1:])
            rates = json.loads(rates)
    latest_date = datetime.datetime(2012, 1, 1)
    for c in CURRENCIES:
        for d in rates.get(c, []):
            date = datetime.datetime.strptime(d, "%Y-%m-%d")
            if date > latest_date:
                latest_date = date
    return latest_date


def update_rates_last():
    latest_date = get_latest_date()
    # get new rates
    start_date = latest_date + datetime.timedelta(days=1)
    end_date = datetime.datetime.now() - datetime.timedelta(days=1)
    days = list(daterange(start_date, end_date))
    if len(days) == 0:
        log('all', f'Found values already in all currencies, skipping update')
        commit()
        return
    
    rates_df = download_for_dates(start_date, end_date)
    for i, date in enumerate(days):
        update_date(date, rates_df)
        if i%2 == 0 and date > datetime.datetime(2020, 1, 1) and random.random() < 0.66: commit(date)
    if random.random() < 0.75: commit()


def download_for_dates(start_date, end_date):
    start_year = start_date.year
    end_year = end_date.year
    df = pd.DataFrame(columns=['data'] + CURRENCIES)
    for y in range(start_year, end_year+1):
        print(f'Downloading for {y}')
        url = f'https://static.nbp.pl/dane/kursy/Archiwum/archiwum_tab_a_{y}.csv'
        with open(DOWNLOAD, 'wb') as f:
            f.write(requests.get(url).content)
        df_y = pd.read_csv(DOWNLOAD, sep=';', engine='python', skipfooter=4)
        for c in df_y.columns:
            if c.lower() == 'data':
                df_y.rename(columns = {c: 'data'}, inplace = True)
                df_y = df_y[df_y['data'].notna()]
                def parse_date(x):
                    x = str(x).split('.')[0]
                    return f'{x[6:]}.{x[4:6]}.{x[:4]}'
                df_y['data'] = df_y['data'].apply(parse_date)
                continue
            for curr in CURRENCIES:
                if curr.lower() in c.lower():
                    df_y.rename(columns = {c: curr}, inplace = True)
                    df_y[curr] = df_y[curr].apply(lambda x: float(x.replace(',', '.')))
                    break
            else: df_y.drop([c], axis=1, inplace=True)
        df = pd.concat([df, df_y])
        os.remove(DOWNLOAD)
    df.reset_index(inplace=True)
    df.drop(['index'], axis=1, inplace=True)
    return df


def update_date(date, rates_df):
    rates = {}
    # read file
    if os.path.exists(RATES_FILE):
        with open(RATES_FILE, 'r') as f:
            rates = '{\n' + '\n'.join(f.read().split('\n')[1:])
            rates = json.loads(rates)
    # get new rates
    date_key = f'{date.year}-{date.month:02}-{date.day:02}'
    holidays = [datetime.datetime(date.year, m, d) for (m, d) in HOLIDAYS]
    if date in holidays or date.weekday() in [5, 6]:
        log(date_key, 'Date is a weekend or holiday, skipping update')
        return
    results = get_rate_of_day(date, rates_df)
    if len(results) == 0:
        log(date_key, 'Couldn\'t find courses')
        return
    for (k, v) in results.items():
        if k not in rates: rates[k] = {}
        rates[k][date_key] = v
    print(date_key, results)
    # save new rates
    # time.sleep(0.5)
    with open(RATES_FILE, 'w+') as f:
        f.write('exchange_rates = ')
        json.dump(rates, f, indent=4)
    log(date_key, 'Updated courses')


def get_rate_of_day(day, rates_df):
    rate_row = rates_df[rates_df['data'] == f'{day.day:02}.{day.month:02}.{day.year}']
    if len(rate_row) == 0: return {}
    results = {}
    for curr in CURRENCIES:
        results[curr] = float(rate_row[curr].iloc[0])
    return results


def commit(date: datetime.datetime = None):
    if date is None:
        date = datetime.datetime.now() #- datetime.timedelta(days=1)
        date_key = f'{date.year}-{date.month:02}-{date.day:02}'
        date_git = ""
    else:
        date_key = f'{date.year}-{date.month:02}-{date.day:02}'
        date_git = date_key + f"T{random.randint(0, 23):02}:{random.randint(0, 59):02}:{random.randint(0, 59):02}"
        date_git = f"GIT_AUTHOR_DATE={date_git} GIT_COMMITTER_DATE={date_git}"
        
    cmd = f"cd {DIR} && "
    cmd += f"git add {RATES_FILE} {LOG_FILE} && "
    cmd += f"{date_git} git commit -m 'exchange rates update on {date_key}' && "
    cmd += "git push"
    os.system(cmd)


if __name__ == '__main__':
    update_rates_last()