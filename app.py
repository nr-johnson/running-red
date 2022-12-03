from flask import Flask, render_template, request
import math
import json 
from os.path import exists

app = Flask(__name__)

levels = {
    '1': {
        'gameLength': 1564,
        'player': {
            'start': [600, 150],
            'health': 100
        },
        'sounds': ['la2','la3','la4','la5','la1'],
        # 'text': [
        #     { 'msg': 'Climb!', 'pos': [385, 220], 'font': '16px sans-serif' }
        # ],
        'objectsHash': [
            "2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x","2.ee x",".vte 1.tcs 1.te.21 x"
        ],
        'images': {
            'background': [
                {'img': '/static/images/backgrounds/woods_13.png', 'index': 0},
                {'img': '/static/images/backgrounds/woods_23.png', 'index': 1},
                {'img': '/static/images/backgrounds/woods_33.png', 'index': 2},
                {'img': '/static/images/backgrounds/woods_43.png', 'index': 3}
            ]
        },
        'npcs': [
            {
                'type': 'imp',
                'start': [200, 70],
                'health': 20,
                'clas': 'enemy',
                'delay': 12,
                'images': ['/static/images/sprites/Imp Sprite Sheet_flipped.png', '/static/images/sprites/Imp Sprite Sheet.png'],
                'frames': [8,6],
                'animations': [
                    {'key': ['left'], 'time': 260},
                    {'key': False, 'time': 200},
                    {'key': ['right', 'down'], 'time': 180},
                    {'key': ['right'], 'time': 200},
                ]
            },
            {
                'type': 'imp',
                'start': [60, 400],
                'health': 20,
                'clas': 'enemy',
                'delay': 12,
                'images': ['/static/images/sprites/Imp Sprite Sheet_flipped.png', '/static/images/sprites/Imp Sprite Sheet.png'],
                'frames': [8,6],
                'animations': [
                    {'key': ['right', 'down'], 'time': 115},
                    {'key': False, 'time': 200},
                    {'key': ['left', 'down'], 'time': 115},
                    {'key': ['right'], 'time': 0},
                    {'key': False, 'time': 200},
                ]
            },
        #     {
        #         'type': 'imp',
        #         'start': [400, 700],
        #         'health': 20,
        #         'clas': 'enemy',
        #         'delay': 12,
        #         'images': ['/static/images/sprites/Imp Sprite Sheet_flipped.png', '/static/images/sprites/Imp Sprite Sheet.png'],
        #         'frames': [8,6],
        #         'animations': [
        #             {'key': ['left'], 'time': 260},
        #             {'key': False, 'time': 200},
        #             {'key': ['right', 'down'], 'time': 180},
        #             {'key': ['right'], 'time': 200},
        #         ]
        #     }
        ],
        'ghosts': [
            {
                'note': 'cat',
                'start': [530,190],
                'delay': 12,
                'speed': .9,
                'images': ['/static/images/sprites/Cat Sprite Sheet_flipped.png', '/static/images/sprites/Cat Sprite Sheet.png'],
                'frames': [8,10],
                'animations': [
                    {'key': False, 'from': [0,0], 'to': [0,3], 'time': 100},
                    {'key': False, 'from': [1,0], 'to': [1,3], 'time': 100},
                    {'key': ['left'], 'from': [4,0], 'to': [4,7], 'time': 60},
                    {'key': False, 'from': [0,0], 'to': [0,3], 'time': 100},
                    {'key': False, 'from': [1,0], 'to': [1,3], 'time': 100},
                    {'key': False, 'from': [2,0], 'to': [2,3], 'time': 100},
                    {'key': False, 'from': [3,0], 'to': [3,3], 'time': 100},
                    {'key': False, 'from': [0,0], 'to': [0,3], 'time': 100},
                    {'key': False, 'from': [1,0], 'to': [1,3], 'time': 100},
                    {'key': ['right'], 'from': [4,0], 'to': [4,7], 'time': 60}
                ]
            },
        #     {
        #         'note': 'fox',
        #         'start': [500,48],
        #         'delay': 12,
        #         'speed': 1,
        #         'images': ['/static/images/sprites/Fox Sprite Sheet_flipped.png', '/static/images/sprites/Fox Sprite Sheet.png'],
        #         'frames': [14,7],
        #         'frame': [5,5],
        #         'animations': [
        #             {'key': False, 'from': [5,0], 'to': [5,5], 'time': 300},
        #             {'key': ['right'], 'from': [2,0], 'to': [2,7], 'time': 220},
        #             {'key': False, 'from': [6,1], 'to': [6,6], 'time': 6},
        #             {'key': False, 'from': [5,0], 'to': [5,5], 'time': 300},
        #             {'key': ['left'], 'from': [2,0], 'to': [2,7], 'time': 220}
        #         ]
        #     }
        ]
    }
}
 
@app.route('/')
def game():
    return render_template('index.html')

@app.route('/data')
def data():
    with open('./level.json') as worldFile:
        worldData = json.load(worldFile)
        return worldData

@app.route('/build', methods=['GET', 'POST'])
def build():
    if request.method == 'POST':
        print(exists('./level.json'))
        with open('./level.json') as worldFile:
            worldData = json.load(worldFile)
        
        with open('./level.json', 'w') as worldFile:
            postedData = request.json
            worldData['gameLength'] = postedData['gameLength']
            worldData['objectsHash'] = postedData['objectsHash']
            json.dump(worldData, worldFile)

        return 'Game Level Saved!'
    else:
        x = int(request.args.get('x'))
        y = int(request.args.get('y'))
        print(f'X: {x}, Y: {y}')
        return render_template('builder.html', x=x, y=y)

if __name__ == '__main__':
    app.run()