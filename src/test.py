import urllib

from flask import Flask, make_response, json
import ipinfo
import requests
from geolib import geohash

#
# access_token = 'fe9ef385fa82d8'
# handler = ipinfo.getHandler(access_token)
# details = handler.getDetails()
# t = json.dumps(details.details)
# print(t)


def get_loc_from_input(input):
    url = 'https://maps.googleapis.com/maps/api/geocode/json?address=University+of+Southern+California+CA&key=AIzaSyCJlzTUGSxhjXhcEKvVB9KjleXRVgF7PeU'
    r = requests.get(url)
    r.encoding = 'utf-8'
    print(json.loads(r.text))
    loc = json.loads(r.text)['results'][0]['geometry']['location']
    print(loc)


def test(obj):
    params = urllib.parse.urlencode(obj)
    apikey = '3YzBjvOZXqXDOJN2S3HAvvBiVNhea9P1'
    # params = 'apikey='+apikey + '&keywords' + search_info.keyword + '&segementId=' +segmentId+'&radius='+search_info.radius+'&unit=miles'
    url = 'https://app.ticketmaster.com/discovery/v2/events.json?'+params
    print(url)


d = {'name':'msy','age':1}
test(d)

def get_segmentId(category):
    dict = {
        'Music' :'KZFzniwnSyZfZ7v7nJ',
        'Sports' :'KZFzniwnSyZfZ7v7nE',
        'Arts&Theatre' :'KZFzniwnSyZfZ7v7na',
        'Film' :'KZFzniwnSyZfZ7v7nn',
        'Miscellaneous' :'KZFzniwnSyZfZ7v7n1',
    }
    return dict[category]

