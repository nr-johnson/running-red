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
            worldData['dimensions'] = postedData['dimensions']
            json.dump(worldData, worldFile)

        return 'Game Level Saved!'
    else:
        with open('./level.json') as worldFile:
            worldData = json.load(worldFile)
            if request.args.get('x'):
                worldData["dimensions"]["x"] = int(request.args.get('x'))
            if request.args.get('y'):
                worldData["dimensions"]["y"] = int(request.args.get('y'))
            
            if len(worldData["objectsHash"]) < worldData["dimensions"]["y"]:
                count = worldData["dimensions"]["y"] - len(worldData["objectsHash"])
                for i in range(count):
                    worldData["objectsHash"].insert(0, '')
            elif len(worldData["objectsHash"]) > worldData["dimensions"]["y"]:
                count = len(worldData["objectsHash"]) - worldData["dimensions"]["y"]
                for i in range(count):
                    worldData["objectsHash"].pop(0)
            

        return render_template('builder.html', data=worldData)
        

if __name__ == '__main__':
    app.run()