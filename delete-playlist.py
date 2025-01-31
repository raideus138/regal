import pyautogui as pya
import time

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

delete_playlists(0)