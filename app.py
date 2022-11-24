from flask import Flask, render_template, request

app = Flask(__name__)

levels = {
    '1': {
        'gameLength': 1600,
        'player': {
            'start': [100, 0],
            'health': 100
        },
        'objectsHash': [
            'x.15 1.gs 1.g 1.ge',
            '',
            '',
            'x.15 1.gs 1.g 1.ge',
            '',
            '',
            'x.15 4.gs 4.g 4.ge',
            'x.30 4.gs 4.g 4.ge',
            'x.30 4.e x.2 4.gs 4.g 4.ge',
            'x.5 1s.gs 1.g.5 1s.ge x.4 1s.gs 1.g.45 1s.ge'
        ],
        'images': {
            'background': [
                {'img': '/static/images/backgrounds/woods_1.png', 'index': 0},
                {'img': '/static/images/backgrounds/woods_2.png', 'index': 1},
                {'img': '/static/images/backgrounds/woods_3.png', 'index': 2}
            ]
        },
        'npcs': [
            {
                'note': 'cat',
                'type': 'generic',
                'start': [360, 150],
                'health': 100,
                'interactive': False,
                'physics': False,
                'sprite': [
                    '/static/images/sprites/Cat Sprite Sheet_flipped.png',
                    '/static/images/sprites/Cat Sprite Sheet.png'
                ],
                'speed': .75,
                'contact': {'mt': 10, 't': 10, 'r': 42, 'b': -8, 'l': 12},
                'frames': [8, 10],
                'delay': 12,
                'animated': [
                    {'from': [0,0], 'to': [0,3], 'key': False, 'time': 100},
                    {'from': [1,0], 'to': [1,3], 'key': False, 'time': 100},
                    {'from': [2,0], 'to': [2,3], 'key': False, 'time': 100},
                    {'from': [3,0], 'to': [3,3], 'key': False, 'time': 100},
                    {'from': [0,0], 'to': [0,3], 'key': False, 'time': 100},
                    {'from': [4,0], 'to': [4,7], 'key': 'right', 'time': 90},
                    {'from': [0,0], 'to': [0,3], 'key': False, 'time': 100},
                    {'from': [4,0], 'to': [4,7], 'key': 'left', 'time': 19},
                    {'from': [0,0], 'to': [0,3], 'key': False, 'time': 50},
                    {'from': [6,0], 'to': [6,3], 'key': False, 'time': 100},
                    {'from': [8,0], 'to': [8,6], 'key': False, 'time': 8},
                    {'from': [4,0], 'to': [4,7], 'key': 'left', 'time': 70},
                    {'from': [9,0], 'to': [9,7], 'key': False, 'time': 100},
                ]
            },
            {
                'note': 'fox',
                'type': 'generic',
                'start': [500, 33],
                'health': 100,
                'interactive': False,
                'physics': False,
                'sprite': [
                    '/static/images/sprites/Fox Sprite Sheet_flipped.png',
                    '/static/images/sprites/Fox Sprite Sheet.png'
                ],
                'speed': .75,
                'contact': {'mt': 10, 't': 10, 'r': 42, 'b': -8, 'l': 12},
                'frames': [14, 7],
                'delay': 12,
                'animated': [
                {'from': [1,0], 'to': [1,1], 'key': 'right', 'time': 1},
                {'from': [6,0], 'to': [6,6], 'key': False, 'time': 7},
                {'from': [5,0], 'to': [5,5], 'key': False, 'time': 300},
                {'from': [2,0], 'to': [2,7], 'key': 'right', 'time': 300},
                {'from': [1,0], 'to': [1, 13], 'key': False, 'time': 50},
                {'from': [1,0], 'to': [1,1], 'key': 'left', 'time': 1},
                {'from': [6,0], 'to': [6,6], 'key': False, 'time': 7},
                {'from': [5,0], 'to': [5,5], 'key': False, 'time': 300},
                {'from': [2,0], 'to': [2,7], 'key': 'left', 'time': 300}]
            },
            {
                'type': 'imp',
                'start': [910, 35],
                'health': 100,
                'animated': [
                    {'key': ['left'], 'time': 260},
                    {'key': False, 'time': 200},
                    {'key': ['right', 'down'], 'time': 180},
                    {'key': ['right'], 'time': 200},
                ]
            },
            {
                'note': 'squirrel',
                'type': 'generic',
                'start': [200, 21],
                'health': 100,
                'interactive': False,
                'physics': False,
                'sprite': [
                    '/static/images/sprites/Squirrel Sprite Sheet_flipped.png',
                    '/static/images/sprites/Squirrel Sprite Sheet.png'
                ],
                'speed': .75,
                'contact': {'mt': 10, 't': 10, 'r': 0, 'b': 3, 'l': 0},
                'frames': [8,7],
                'delay': 20,
                'animated': [
                    {'from': [0,0], 'to': [0,4], 'key': False, 'time': 20},
                    {'from': [1,0], 'to': [1,4], 'key': False, 'time': 20},
                    {'from': [2,0], 'to': [2,7], 'key': 'right', 'time': 200},
                    {'from': [3,0], 'to': [3,3], 'key': False, 'time': 100},
                    {'from': [4,0], 'to': [4,1], 'key': False, 'time': 200},
                    {'from': [2,0], 'to': [2,7], 'key': 'left', 'time': 10},
                    {'from': [3,0], 'to': [3,3], 'key': False, 'time': 100},
                    {'from': [4,0], 'to': [4,1], 'key': False, 'time': 200},
                    {'from': [2,0], 'to': [2,7], 'key': 'right', 'time': 10},
                    {'from': [0,0], 'to': [0,4], 'key': False, 'time': 20},
                    {'from': [1,0], 'to': [1,4], 'key': False, 'time': 20},
                    {'from': [2,0], 'to': [2,7], 'key': 'left', 'time': 200}
                ]
            }
        ]
    }
}
 
@app.route('/')
def game():
    return render_template('index.html')

@app.route('/data')
def data():
    lvl = request.args.get('level')
    print(lvl)
    return levels[lvl]

if __name__ == '__main__':
    app.run()