from flask import Flask, make_response, json, request, jsonify
import urllib
import ipinfo
import requests
from flask_cors import CORS
from geolib import geohash

app = Flask(__name__)
CORS(app)


apikey = '3YzBjvOZXqXDOJN2S3HAvvBiVNhea9P1'


@app.route('/')
def hello():
    """Return a friendly HTTP greeting."""
    return 'Hello World!'


def get_location_by_ip():
    access_token = 'fe9ef385fa82d8'
    handler = ipinfo.getHandler(access_token)
    details = handler.getDetails()
    return details.loc


def get_loc_from_input(input):
    url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + \
        input+'&key=AIzaSyCJlzTUGSxhjXhcEKvVB9KjleXRVgF7PeU'
    r = requests.get(url)
    r.encoding = 'utf-8'
    if len(json.loads(r.text)['results']) > 0:
        loc = json.loads(r.text)['results'][0]['geometry']['location']
        return loc
    else:
        return None


@app.route('/search')
def search():
    request.method == 'GET'
    args = request.args
    param = get_params(args)
    query_results = json.loads(get_ticketmaster_results(param))
    return jsonify(query_results)


@app.route('/detail')
def detail():
    request.method == 'GET'
    args = request.args
    id = args.get('id')
    detail_url = f'https://app.ticketmaster.com/discovery/v2/events/{id}?apikey={apikey}'
    r = requests.get(detail_url)
    r.encoding = 'utf-8'
    query_results = json.loads(r.text)
    return jsonify(query_results)


@app.route('/venue')
def get_venue():
    request.method == 'GET'
    args = request.args
    keyword = args.get('keyword')
    detail_url = f'https://app.ticketmaster.com/discovery/v2/venues?apikey={apikey}&keyword={keyword}'
    r = requests.get(detail_url)
    r.encoding = 'utf-8'
    query_results = json.loads(r.text)
    return jsonify(query_results)
# CU+Events+Center
# https://app.ticketmaster.com/discovery/v2/venues?apikey=3YzBjvOZXqXDOJN2S3HAvvBiVNhea9P1&keyword=CU+Events+Center

def get_params(args):
    param = {}
    type = args.get('type')
    param['apikey'] = apikey
    keyword = args.get('keyword')
    param['keyword'] = '+'.join(keyword)

    if args.get('category') != 'Default':
        param['segmentId'] = get_segmentId(args.get('category'))
    param['radius'] = args.get('distance')
    param['unit'] = 'miles'
    if type == '0':
        loc = get_location_by_ip()
        location = loc.split(',')
        geoCode = geohash.encode(location[0], location[1], 7)
    else:
        location = get_loc_from_input(args.get('location'))
        if location != None:
            geoCode = geohash.encode(location['lat'], location['lng'], 7)
        else:
            geoCode = ''
    param['geoPoint'] = geoCode
    return param


def get_ticketmaster_results(obj):
    params = urllib.parse.urlencode(obj)
    url = 'https://app.ticketmaster.com/discovery/v2/events.json?'+params
    r = requests.get(url)
    r.encoding = 'utf-8'
    return r.text


def get_segmentId(category):
    dict = {
        'Music': 'KZFzniwnSyZfZ7v7nJ',
        'Sports': 'KZFzniwnSyZfZ7v7nE',
        'Arts&Theatre': 'KZFzniwnSyZfZ7v7na',
        'Film': 'KZFzniwnSyZfZ7v7nn',
        'Miscellaneous': 'KZFzniwnSyZfZ7v7n1'
    }
    return dict[category]


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. You
    # can configure startup instructions by adding `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python3_app]
# [END gae_python38_app]
