<<<<<<< HEAD
from flask import Flask, session, render_template, request, redirect
import pyrebase
import requests
from urllib.parse import quote  # URLエンコード用
from dotenv import load_dotenv
import os

# Flask アプリケーションのインスタンスを定義
app = Flask(__name__)
load_dotenv()

# Firebase 設定
config = {
    'apiKey': "AIzaSyCk-KoUlQlnznHTVrzuc1ecxVCbrKuOuRs",
    'authDomain': "move-sync-67647.firebaseapp.com",
    'projectId': "move-sync-67647",
    'storageBucket': "move-sync-67647.firebasestorage.app",
    'messagingSenderId': "4603947654",
    'appId': "1:4603947654:web:9ba795da402bec2f48bf07",
    'measurementId': "G-FJWTBQDDHQ",
    'databaseURL': "https://move-sync-67647-default-rtdb.firebaseio.com/"  # Database URLを追加
}
firebase = pyrebase.initialize_app(config)
auth = firebase.auth()
db = firebase.database()  # Firebase Database 初期化
=======
from flask import Flask, jsonify, request, Response, render_template
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime, timedelta
from urllib.parse import quote  # URLエンコード用
from bs4 import BeautifulSoup
import requests
import os
import json
import pytz

# Flask アプリケーションのインスタンスを定義
app = Flask(__name__)

CORS(app)

# .env をロード(APIキーの取得)

load_dotenv()

# OpenWeather APIのキーを環境変数から取得
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

# 公共交通オープンデータセンター のAPIのキーを環境変数から取得
TRANSPORT_API_KEY = os.getenv('TRANSPORT_API_KEY')
>>>>>>> main

app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')


# Firebaseから都市名をロード
def load_latest_city():
    try:
        cities = db.child("cities").get().val()
        if cities:
            return list(cities.values())[-1]  # 最新の都市名を取得
    except Exception as e:
        print(f"Error loading cities: {e}")
    return None


# Firebaseに都市名を保存
def save_city(city):
    try:
        db.child("cities").push(city)
    except Exception as e:
        print(f"Error saving city: {e}")


@app.route('/', methods=['POST', 'GET'])
def login():
    if 'user' in session:
        return redirect('/home')
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        try:
            auth.sign_in_with_email_and_password(email, password)
            session['user'] = email
            return redirect('/home')
        except Exception as e:
            return f'Failed to login: {str(e)}'
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')


@app.route('/home', methods=['POST', 'GET'])
def home():
    if 'user' not in session:
        return redirect('/')

    # 保存された最新の都市名を取得
    latest_city = load_latest_city()
    weather_data = None

    if request.method == 'POST':
        city = request.form.get('city')
        if city:
            save_city(city)  # Firebaseに保存
            latest_city = city  # 最新の都市名を更新

    # 最新の都市名がある場合は天気情報を取得
    if latest_city:
        weather_data = get_weather(latest_city)

    return render_template('home.html', city=latest_city, weather=weather_data)


def get_weather(city):
    city_encoded = quote(city)
    weather_url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        'q': city_encoded,
        'appid': OPENWEATHER_API_KEY,
        'units': 'metric',
        'lang': 'ja',
        'cnt': 8
    }
    weather_response = requests.get(weather_url, params=params)
<<<<<<< HEAD
=======

>>>>>>> main
    if weather_response.status_code != 200:
        return None
    return weather_response.json()

<<<<<<< HEAD
=======
    weather_data = weather_response.json()

    return jsonify(weather_data)
    
    return jsonify(result), 200

# サービス遅延情報を取得する関数
def get_delay_info():
    url = "https://transit.yahoo.co.jp/diainfo/135/0"
    response = requests.get(url)
    
    if response.status_code == 200:
        # HTMLの解析
        soup = BeautifulSoup(response.text, 'html.parser')

        # 'elmServiceStatus'のdivを検索
        service_status = soup.find('div', {'class': 'elmServiceStatus'})

        # サービスステータスが見つかった場合
        if service_status:
            # "平常運転" が含まれているか確認
            if "平常運転" in service_status.text:
                return "平常運転"
            else:
                return "遅延可能性"
        else:
            return "サービスステータスが見つかりませんでした。"
    else:
        return "遅延情報の取得に失敗しました。"

# 時刻表の取得  
@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    # ベースURL
    base_url = 'https://api.odpt.org/api/v4/odpt:StationTimetable'

    # APIキーをクエリパラメータとして渡す
    params = {'acl:consumerKey': TRANSPORT_API_KEY}

    # requestsを使ってURLを構築し、GETリクエストを送信
    response = requests.get(base_url, params=params, timeout=(60.0, 60.0))

    if response.status_code != 200:
        return jsonify({'error': 'Failed to retrieve data.'}), 500

    # JSONデータを取得
    data = response.json()

    # フィルタリングされたデータを取得
    filtered_data = [
        timetable_item
        for item in data
        for timetable_item in item.get("odpt:stationTimetableObject")
        if timetable_item.get("odpt:train", "").startswith("odpt.Train:TokyoMetro.Tozai.")
    ]
    
    # 必要な駅の時刻表のみ抽出
    filtered_data = filtered_data[0:194]

    # 駅名の辞書（必要に応じて増やす）
    station_name_mapping = {
        "odpt.Station:TokyoMetro.Tozai.Nakano": "中野",
        "odpt.Station:ToyoRapid.ToyoRapid.ToyoKatsutadai": "東葉勝田台",
        "odpt.Station:JR-East.ChuoSobuLocal.Mitaka": "三鷹",
        "odpt.Station:TokyoMetro.Tozai.Toyocho": "東陽町",
        "odpt.Station:TokyoMetro.Tozai.NishiFunabashi": "西船橋",
        "odpt.Station:TokyoMetro.Tozai.Kudanshita": "九段下",
    }

    # 現在時刻を取得し、Tokyoタイムゾーンに設定
    jst = pytz.timezone('Asia/Tokyo')
    current_time = datetime.now(jst)

    # 現在時刻を`datetime`オブジェクトで取得
    current_time_str = current_time.strftime("%H:%M")
    current_time_obj = datetime.strptime(current_time_str, "%H:%M")

    # 西船橋発・高田馬場着の時刻表を作成
    def format_train_info(timetable_item):
        departure_time_str = timetable_item.get("odpt:departureTime", "不明")
        
        # もしdeparture_timeが「不明」でなければ、datetimeオブジェクトに変換
        if departure_time_str != "不明":
            departure_time = datetime.strptime(departure_time_str, "%H:%M")
            
            # 47分を加算(西船橋-高田馬場間)
            arrival_time = departure_time + timedelta(minutes=47)
            
            # arrival_timeを文字列に変換
            arrival_time_str = arrival_time.strftime("%H:%M")
        else:
            arrival_time_str = "不明"
        
        destination_station_code = timetable_item.get("odpt:destinationStation", [])[0]
        destination_station_name = station_name_mapping.get(destination_station_code, "不明な駅")
        
        # departure_timeとarrival_timeを含む辞書を返す
        return {
            "departure_time": departure_time_str,
            "arrival_time": arrival_time_str,
            "destination": destination_station_name
        }

    # `filtered_data`内の各オブジェクトを`format_train_info`で文字列化
    formatted_data = [format_train_info(timetable_item) for timetable_item in filtered_data]

    # 現在時刻以降の電車をフィルタリング
    future_trains = [train for train in formatted_data if datetime.strptime(train['departure_time'], "%H:%M") >= current_time_obj]

    # もし未来の電車が3本未満の場合は、翌日の電車も取得する
    if len(future_trains) < 3:
        # 翌日の時刻表を追加（ここでは単純に日付を1日進めて再取得する）
        next_day_trains = [train for train in formatted_data if datetime.strptime(train['departure_time'], "%H:%M") < current_time_obj]
        future_trains += next_day_trains[:3 - len(future_trains)]

    # 未来の電車が3本になるまで取得
    future_trains = future_trains[:3]

    # 遅延情報を取得
    delay_info = get_delay_info()

    # 各列車情報に遅延情報を追加
    for train in future_trains:
        train['遅延情報'] = delay_info

    return jsonify(future_trains)
>>>>>>> main

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
