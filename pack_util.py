import os
import subprocess
import sys;

action = sys.argv[1]
pack = ""
if (len(sys.argv) == 3):
    pack = sys.argv[2]
    

full_path = os.path.realpath(__file__)
path, filename = os.path.split(full_path)

if (action == "unpack"):
    for folder in os.listdir('packs'):
        if (folder != "_source" and (not pack or (pack and pack == folder))):
           subprocess.run(["fvtt", "package", "--in", "./packs", "--out", os.path.join("./src/packs",  folder) , "-n", folder, "--type", "Module", "unpack", folder], shell = os.name == "nt")

if (action == "pack"):
    for folder in os.listdir('src/packs'):
        if (not pack or (pack and pack == folder)):
            subprocess.run(["fvtt", "package", "--in", os.path.join("./src/packs",  folder), "--out", "./packs/", "-n", folder, "--type", "Module", "pack", folder], shell = os.name == "nt")