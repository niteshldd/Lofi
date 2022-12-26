from selenium import webdriver
from selenium.webdriver.support.ui import Select
import time
import random
import requests

browser = webdriver.Chrome()
browser.get('http://lofi_stage.gate.taicudt.com:8084/')

cnt = 0
loops = 10
timeout = 90 * loops + 30
mod_names = requests.get('http://lofiapi_stage.gate.taicudt.com:8084/getModels').json()['models'][1:]
preset_names = [p['name'] for p in requests.get('http://lofiapi_stage.gate.taicudt.com:8084/getPresets').json()]

while True:
    browser.refresh()
    time.sleep(5)
    mod = Select(browser.find_element('id', 'model-select'))
    mod.select_by_visible_text(random.sample(mod_names, 1)[0])
    time.sleep(2)

    preset_lock = browser.find_element('id', 'lock-check')
    if preset_lock.is_selected():
        preset_lock.click()
        time.sleep(2)

    preset = Select(browser.find_element('id', 'preset-select'))
    preset.select_by_visible_text(random.sample(preset_names, 1)[0])
    time.sleep(2)

    preset_lock.click()
    time.sleep(2)

    loop_num = browser.find_element('id', 'loop-num')
    loop_num.send_keys(str(loops))
    time.sleep(2)

    loop_button = browser.find_element('id', 'loop-button')
    loop_button.click()
    time.sleep(2)

    progress = browser.find_element('id', 'progress')
    curr, total = progress.text.split('/')
    t1 = time.time()
    while int(curr) < int(total) and time.time() - t1 < timeout:
        time.sleep(30)
        curr, total = progress.text.split('/')
        print(f"loop {cnt} times, {curr}/{total}")
    clear = browser.find_element('id', 'clear-button')
    clear.click()
    time.sleep(10)
    cnt += loops
    print(f"loop {cnt} times")
