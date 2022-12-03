from flask import Flask, render_template, request
import math
import json 
from os.path import exists

app = Flask(__name__)

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