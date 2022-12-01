from flask import Flask, render_template, request

app = Flask(__name__)

levels = {
    '1': {
        'gameLength': 1600,
        'player': {
            'start': [100, 130],
            'health': 100
        },
        'sounds': ['la2','la3','la4','la5','la1'],
        'text': [
            { 'msg': 'Climb!', 'pos': [385, 220], 'font': '16px sans-serif' }
        ],
        'objectsHash': [
            'x.15 1s.gs 1.g.10 1s.ge',
            '',
            '',
            'x.15 1.gs 1.g 1.ge x.20 1.gs 1.g 1.ge',
            '',
            '',
            'x.15 1.gs 1.g 1.ge',
            '',
            '',
            'x.15 1.gs 1.g 1.ge',
            '',
            '',
            'x.15 1.gs 1.g 1.ge',
            '',
            '',
            'x.15 1.gs 1.g 1.ge',
            '',
            '',
            'x.15 1.gs 1.g 1.ge',
            'x.23 1.gs 1.g 1.ge',
            '',
            '',
            'x.30 4.gs 4.g 4.ge',
            '',
            'x.5 1s.gs 1.g.5 1s.ge x.4 1s.gs 1.g.10 1s.ge x.4 1.gs 1.g.40 1.ge'
        ],
        'images': {
            'background': [
                {'img': '/static/images/backgrounds/mountains1.png', 'index': 0},
                {'img': '/static/images/backgrounds/mountains2.png', 'index': 1},
                {'img': '/static/images/backgrounds/mountains3.png', 'index': 2},
                {'img': '/static/images/backgrounds/mountains4.png', 'index': 3},
                {'img': '/static/images/backgrounds/mountains5.png', 'index': 4}
            ]
        },
        'npcs': [
            {
                'type': 'imp',
                'start': [910, 70],
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
                'start': [820, 70],
                'health': 20,
                'clas': 'enemy',
                'delay': 12,
                'images': ['/static/images/sprites/Imp Sprite Sheet_flipped.png', '/static/images/sprites/Imp Sprite Sheet.png'],
                'frames': [8,6],
                'animations': [
                    {'key': ['right'], 'time': 260},
                    {'key': False, 'time': 200},
                    {'key': ['left', 'down'], 'time': 180},
                    {'key': ['left'], 'time': 200},
                ]
            },
            {
                'type': 'imp',
                'start': [400, 700],
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
            }
        ],
        'ghosts': [
            {
                'note': 'cat',
                'start': [430,190],
                'delay': 12,
                'speed': .9,
                'images': ['/static/images/sprites/Cat Sprite Sheet_flipped.png', '/static/images/sprites/Cat Sprite Sheet.png'],
                'frames': [8,10],
                'animations': [
                    {'key': False, 'from': [0,0], 'to': [0,3], 'time': 100},
                    {'key': False, 'from': [1,0], 'to': [1,3], 'time': 100},
                    {'key': ['left'], 'from': [4,0], 'to': [4,7], 'time': 70},
                    {'key': False, 'from': [0,0], 'to': [0,3], 'time': 100},
                    {'key': False, 'from': [1,0], 'to': [1,3], 'time': 100},
                    {'key': False, 'from': [2,0], 'to': [2,3], 'time': 100},
                    {'key': False, 'from': [3,0], 'to': [3,3], 'time': 100},
                    {'key': False, 'from': [0,0], 'to': [0,3], 'time': 100},
                    {'key': False, 'from': [1,0], 'to': [1,3], 'time': 100},
                    {'key': ['right'], 'from': [4,0], 'to': [4,7], 'time': 70}
                ]
            },
            {
                'note': 'fox',
                'start': [500,48],
                'delay': 12,
                'speed': 1,
                'images': ['/static/images/sprites/Fox Sprite Sheet_flipped.png', '/static/images/sprites/Fox Sprite Sheet.png'],
                'frames': [14,7],
                'frame': [5,5],
                'animations': [
                    {'key': False, 'from': [5,0], 'to': [5,5], 'time': 300},
                    {'key': ['right'], 'from': [2,0], 'to': [2,7], 'time': 220},
                    {'key': False, 'from': [6,1], 'to': [6,6], 'time': 6},
                    {'key': False, 'from': [5,0], 'to': [5,5], 'time': 300},
                    {'key': ['left'], 'from': [2,0], 'to': [2,7], 'time': 220}
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

    # {
    #     'note': 'squirrel',
    #     'type': 'generic',
    #     'start': [200, 21],
    #     'health': 100,
    #     'interactive': False,
    #     'physics': False,
    #     'sprite': [
    #         '/static/images/sprites/Squirrel Sprite Sheet_flipped.png',
    #         '/static/images/sprites/Squirrel Sprite Sheet.png'
    #     ],
    #     'speed': .75,
    #     'contact': {'mt': 10, 't': 10, 'r': 0, 'b': 3, 'l': 0},
    #     'frames': [8,7],
    #     'delay': 20,
    #     'animated': [
    #         {'from': [0,0], 'to': [0,4], 'key': False, 'time': 20},
    #         {'from': [1,0], 'to': [1,4], 'key': False, 'time': 20},
    #         {'from': [2,0], 'to': [2,7], 'key': 'right', 'time': 200},
    #         {'from': [3,0], 'to': [3,3], 'key': False, 'time': 100},
    #         {'from': [4,0], 'to': [4,1], 'key': False, 'time': 200},
    #         {'from': [2,0], 'to': [2,7], 'key': 'left', 'time': 10},
    #         {'from': [3,0], 'to': [3,3], 'key': False, 'time': 100},
    #         {'from': [4,0], 'to': [4,1], 'key': False, 'time': 200},
    #         {'from': [2,0], 'to': [2,7], 'key': 'right', 'time': 10},
    #         {'from': [0,0], 'to': [0,4], 'key': False, 'time': 20},
    #         {'from': [1,0], 'to': [1,4], 'key': False, 'time': 20},
    #         {'from': [2,0], 'to': [2,7], 'key': 'left', 'time': 200}
    #     ]
    # }
    # {
    #     'note': 'cat',
    #     'type': 'generic',
    #     'start': [360, 150],
    #     'health': 100,
    #     'interactive': False,
    #     'physics': False,
    #     'sprite': [
    #         '/static/images/sprites/Cat Sprite Sheet_flipped.png',
    #         '/static/images/sprites/Cat Sprite Sheet.png'
    #     ],
    #     'speed': .75,
    #     'contact': {'mt': 10, 't': 10, 'r': 42, 'b': -8, 'l': 12},
    #     'frames': [8, 10],
    #     'delay': 12,
    #     'animated': [
    #         {'from': [0,0], 'to': [0,3], 'key': False, 'time': 100},
    #         {'from': [1,0], 'to': [1,3], 'key': False, 'time': 100},
    #         {'from': [2,0], 'to': [2,3], 'key': False, 'time': 100},
    #         {'from': [3,0], 'to': [3,3], 'key': False, 'time': 100},
    #         {'from': [0,0], 'to': [0,3], 'key': False, 'time': 100},
    #         {'from': [4,0], 'to': [4,7], 'key': 'right', 'time': 90},
    #         {'from': [0,0], 'to': [0,3], 'key': False, 'time': 100},
    #         {'from': [4,0], 'to': [4,7], 'key': 'left', 'time': 19},
    #         {'from': [0,0], 'to': [0,3], 'key': False, 'time': 50},
    #         {'from': [6,0], 'to': [6,3], 'key': False, 'time': 100},
    #         {'from': [8,0], 'to': [8,6], 'key': False, 'time': 8},
    #         {'from': [4,0], 'to': [4,7], 'key': 'left', 'time': 70},
    #         {'from': [9,0], 'to': [9,7], 'key': False, 'time': 100},
    #     ]
    # },
    # {
    #     'note': 'fox',
    #     'type': 'generic',
    #     'start': [500, 33],
    #     'health': 100,
    #     'interactive': False,
    #     'physics': False,
    #     'sprite': [
    #         '/static/images/sprites/Fox Sprite Sheet_flipped.png',
    #         '/static/images/sprites/Fox Sprite Sheet.png'
    #     ],
    #     'speed': .75,
    #     'contact': {'mt': 10, 't': 10, 'r': 42, 'b': -8, 'l': 12},
    #     'frames': [14, 7],
    #     'delay': 12,
    #     'animated': [
    #     {'from': [1,0], 'to': [1,1], 'key': 'right', 'time': 1},
    #     {'from': [6,0], 'to': [6,6], 'key': False, 'time': 7},
    #     {'from': [5,0], 'to': [5,5], 'key': False, 'time': 300},
    #     {'from': [2,0], 'to': [2,7], 'key': 'right', 'time': 300},
    #     {'from': [1,0], 'to': [1, 13], 'key': False, 'time': 50},
    #     {'from': [1,0], 'to': [1,1], 'key': 'left', 'time': 1},
    #     {'from': [6,0], 'to': [6,6], 'key': False, 'time': 7},
    #     {'from': [5,0], 'to': [5,5], 'key': False, 'time': 300},
    #     {'from': [2,0], 'to': [2,7], 'key': 'left', 'time': 300}]
    # },