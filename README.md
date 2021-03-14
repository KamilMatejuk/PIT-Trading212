# PIT-38 Trading212
Skrypt pomagający wyliczyć należne podatki, na podstawie danych z brokera [Traing212](https://trading212.com), [Coinbase](https://www.coinbase.com) dla kont w walucie `EUR`.


| :warning: :warning: :warning: |
|:---:|
| Ponizszy materiał nie stanowi w żadnym wypadku porady prawnej, wartości wyliczone na jego podstawie są wykorzystywane tylko i wyłącznie na odpowiedzialność użytkownika |


# Zasady podatkowe:
Należy się upewnić, że ma się aktywny formularz [W-8BEN](https://helpcentre.trading212.com/hc/en-us/articles/360007139318-How-to-fill-in-a-W-8BEN-Form-)

## Wyliczanie podatków dla dywidend:
1. Przelicz wszystkie wartości na `PLN`, zgodnie z kursem z dnia poprzedniego
2. `D2` = suma kwoty otrzymanych dywidend
3. `D3` = podatek jaki należy zapłacić w polsce (19% z `D2`)
4. `D4` = podatek jaki już został odliczony przez Trading212 *(withholding tax)*
5. `D5` = różnica pomiędzy `D3` a `D4`, jaką należy dopłacić

## Uzupełnianie dywidend w PIT-38
1. W polu 45 sekcji G wpisać `D3`
2. W polu 46 sekcji G wpisać `D4`
3. W polu 47 sekcji G wpisać `D5`

## Wyliczanie podatków dla akcji:
Dla każdej sprzedanej akcji (zgodnie z zasadą FIFO: *First In First Out*):
1. Przelicz wszystkie wartości na `PLN`, zgodnie z kursem z dnia poprzedniego
2. `P` = przychód ze sprzedarzy tej konkretnej akcji *(FIFO!!!)*
3. `K` = koszt kupna tej konkretnej akcji *(FIFO!!!)*
4. `D` = dochód, czyli różnica pomiędzy `K` a `P`
Następnie zsumować wszystkie wartości.

## Uzupełnianie akcji w PIT-38
1. W polu 22 sekcji C wpisać zsumowane `P`
2. W polu 23 sekcji C wpisać zsumowane `K`
3. Jeżeli dochody pochodzą z zagranicy, dla każdego państwa należy załączyć osobny dokument **PIT/ZG**
    1. W polu 6 sekcji B wpisać nazwę państwa
    2. W polu 32 sekcji C wpisać zsumowane `D`
    3. W polu 33 sekcji C wpisać podatek zapłacony za granicą (0.00)

## Źródła
* `30.04.2020r` [Jak rozliczyć podatek od dywidendy zagranicznej i zysk na akcjach](https://jakoszczedzacpieniadze.pl/jak-rozliczyc-podatek-od-dywidendy-zagranicznej-i-zysk-na-akcjach-jaki-pit)
* `19.04.2021r` [Jak poprawnie rozliczyć podatek od zysków kapitałowych](https://www.najlepszekonto.pl/jak-poprawnie-rozliczyc-podatek-od-zyskow-kapitalowych)
* `13.07.2016r` [Oficjalne forum Trading212](https://forex-nawigator.biz/forum/post824020.html#p824020)
* `20.03.2021r` [Help Center: Do you charge any taxes on profits?](https://helpcentre.trading212.com/hc/en-us/articles/360007080857-Do-you-charge-any-taxes-on-profits-)
* `20.02.2021r` [Help Center: W-8BEN](https://helpcentre.trading212.com/hc/en-us/articles/360007080877-W-8BEN)
* `20.04.2020r` [Help Center: How to fill in a W-8BEN Form?](https://helpcentre.trading212.com/hc/en-us/articles/360007139318-How-to-fill-in-a-W-8BEN-Form-)

## Todo
* rozpisać instrukcję, zgodnie z *podatki.gov.pl*
