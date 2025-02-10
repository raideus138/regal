import pyautogui as pya
import time
import subprocess as sp

def delete_playlists(num_playlists):
    screenWidth, screenHeight = pya.size()
    spotify = pya.getWindowsWithTitle('Spotify')[0]
    spotify.activate()
    
    for _ in range(num_playlists):
        pya.mouseDown(x=300, y=350)
        pya.click(button='right')
        time.sleep(0.5)  
        
        pya.moveTo(x=320, y=550)
        pya.click()
        time.sleep(0.5)  
        
        pya.moveTo(x=(screenWidth/2)+65, y=(screenHeight/2)+55) 
        pya.click()
        time.sleep(1)  

def delete_unused_dependencies():
    file = './requeriments-not-use'
    if file:    
        file = open(file, 'r')
        file = file.readlines()
        print(file)
        for line in file:
            l = line.split('@')
            comand = f'npm uninstall {l[0]}'
            sp.run(comand, capture_output=True, text=True, shell=True)
        
delete_unused_dependencies()
