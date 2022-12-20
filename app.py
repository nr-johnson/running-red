from flask import Flask, render_template, request
import math
import json 
from os.path import exists

app = Flask(__name__)

# Loads main game page
@app.route('/')
def game():
    return render_template('index.html')

# Gets world data for the level to be build (called by front end)
@app.route('/data')
def data():
    # Opens world data file, reads it and send data to user
    with open('./level.json') as worldFile:
        worldData = json.load(worldFile)
        return worldData

# Handles reqiests for the builder
@app.route('/build', methods=['GET', 'POST'])
def build():
    # Save changes to world data made in the builder
    if request.method == 'POST':
        # # Read current world data
        # with open('./level.json') as worldFile:
        #     worldData = json.load(worldFile)
        
        # # Overwrite world data file
        # with open('./level.json', 'w') as worldFile:
        #     # Data from user to be save
        #     postedData = request.json
        #     # Overwrites each element in the file with the data from the user
        #     worldData['gameLength'] = postedData['gameLength']
        #     worldData['objectsHash'] = postedData['objectsHash']
        #     worldData['dimensions'] = postedData['dimensions']
        #     worldData['player']['start'] = postedData['player']['start']
        #     worldData['npcs'] = postedData['sprites']
        #     worldData['supplies'] = postedData['supplies']
        #     # Saves file
        #     json.dump(worldData, worldFile)

        # return 'Game Level Saved!'
        return "Game level WOULD HAVE BEEN Saved! =P"
    else:
        # Loads the builder
        
        # Opens and reads the world data file
        with open('./level.json') as worldFile:
            worldData = json.load(worldFile)
            # Sets new world size variables if provided in the url
            if request.args.get('x'):
                worldData["dimensions"]["x"] = int(request.args.get('x'))
            if request.args.get('y'):
                worldData["dimensions"]["y"] = int(request.args.get('y'))
            
            # if provided height of world is greater than the previously set height, insert empty strings to beginning of world's objetcHash array 
            if len(worldData["objectsHash"]) < worldData["dimensions"]["y"]:
                count = worldData["dimensions"]["y"] - len(worldData["objectsHash"])
                for i in range(count):
                    worldData["objectsHash"].insert(0, '')
            # if provided height of world is less than previously set height, remove items from the beginning of world's objectHash array.
            elif len(worldData["objectsHash"]) > worldData["dimensions"]["y"]:
                count = len(worldData["objectsHash"]) - worldData["dimensions"]["y"]
                for i in range(count):
                    worldData["objectsHash"].pop(0)
            
        # Render builder with provided data
        return render_template('builder.html', data=worldData)
        

if __name__ == '__main__':
    app.run(host="0.0.0.0")