
![GitHub All Releases](https://img.shields.io/github/downloads/rinnocenti/innocenti-openlock/total)
![GitHub Releases](https://img.shields.io/github/downloads/rinnocenti/innocenti-openlock/v0.1.2/total)
# Innocenti OpenLock
A simple module to use loot actors and it will be possible to configure traps and locks.
It was created for testing and learning purposes with foundry vtt
## Installation
You can install this module by using the following manifest URL : https://raw.githubusercontent.com/rinnocenti/innocenti-openlock/main/module.json

As GM go to the Manage Modules options menu in your World Settings tab then enable the Innocenti-OpenLock.
<img src="https://github.com/rinnocenti/innocenti-openlock/blob/main/imgs/readme01.png" width="70%" height="70%">
#### Thieves' Tool 
Name of the item used as thieves' tools.
By default, it always accepts `Thieves’ Tools`, and/or the name for its translation in the language file and/or the one indicated in these settings.
#### Maximum distance for perception (in grids) 
The maximum grid distance for the perception action to be performed.
#### Maximum distance to interact (in grids) 
the maximum distance for players to interact with the lock in number of grids.
#### Remove Lock 
if enabled, whenever the chest is opened the lock item will be removed from the chest items.
#### Repeat Check 
if enabled, players will be able to repeat the check the same loot.

## Dependencies
This module was created to work in a world with other support modules so you don't have to increase your workload.

The module is system dependent:
  * System Dnd5 (v. 0.98 or greater)

And the Modules:
* Furnace (by kakaroto) for advanced macros: https://github.com/kakaroto/fvtt-module-furnace
* Midi QoL (by tposney) for damage Workflow: https://gitlab.com/tposney/midi-qol/raw/master/package/module.json
* Loot Sheet npc5e (by ChalkOne) for loot sheet: https://raw.githubusercontent.com/jopeek/fvtt-loot-sheet-npc-5e/master/module.json

## How to Use
the module basically works looking for a feat that has the open lock option enabled in loot sheet with the character's target and macro activation.

1) Create an NPC using the loot sheet.
<img src="https://github.com/rinnocenti/innocenti-openlock/blob/main/imgs/readme04.png" width="70%" height="70%">

2) Create an item of type **Feat** and in the tab **Open Lock** for settings.
<img src="https://github.com/rinnocenti/innocenti-openlock/blob/main/imgs/readme02.png" width="70%" height="70%">
If you have a lock trap, set the damage and the actions in this item in detail tab. If you select an **Action Type** it will recognize this trapped lock, if empty it will consider that there are no traps.

#### Enable Lock/Trap 
feat to function as locks need to activate the module on the item.

#### Item Key Name 
if you want this lock to have a key, fill with the **exact** name of the item you want to use as a key for that lock.

#### Disarm Trap DC 
the value for the difficulty class to disarm the trap on it, the player will make a dexterity Tool check against this value, it will only be tested if the player has the item thieves' tools in his inventory.

#### Find Trap DC 
the value for the difficulty class to find the trap in close distance, the player will make a perception/investigation test against this value

#### Passive Find Trap DC 
the value for the difficulty class to find the trap in distance, will be tested against the passive perception, if it is not successful a test of the perception or investigation skill will be requested.

#### Force Lock DC 
the value for the difficulty class to force open the lock, the player will make a strength test against this value to open the lock. The lock will only be broken if the player passes the CD + Threshold test.

#### Open Lock DC 
the value for the difficulty class to open the lock, it is necessary to have one thieves'tool in your inventory. the player will make a Tool Dexterity test against this value to open the lock.

#### Threshold of Tools Break 
If the value of the thieves' tools use test is below the threshold indicated, the tool will break and will be removed from the character's inventory.

3) Place the "Lock" object on the loot sheet.

4) Create two macros with permission for all your players with the following content:

macro1 - FIND TRAP 
`let actions = new InnocentiOpenLock.Actions('FindLockTrap');`

macro2 - OPEN CHEST
`let actions = new InnocentiOpenLock.Actions('OpenLock');`

Advanced: you can also separate the workflow into individual macros, just change the name of the actions in parentheses.
`'Breaklock', 'Picklock', 'DisarmTraps'`

there are examples in the module pack

5)The player must aim at the token of the chest and choose one of the macro actions.
<img src="https://github.com/rinnocenti/innocenti-openlock/blob/main/imgs/readme03.png" width="70%" height="70%">

### Macro 1: Find Trap
Find Trap will test the passive perception of the player against the DC, to identify if there is a trap, if there a Key and if lock is blocked.

If the passive perception does not reach the DC, the player will be asked for a perception/investigation check.

if you succeed in any of the perception tests the option to "disarm the trap" will appear when trying to open the loot(player need to have the thieves'tools in your inventary).

A chat card will be created with the results, including the indication if player has the key (if the lock has one, the player has the correct one and passed the perception test for looking for).

### Macro 2: Open Chest
* Makes an attempt to open the chest.
* If the player has permission for that chest or has the key to it, the chest will be opened immediately. Otherwise, a dialog will be displayed for ways to open the chest, using stranght check or using thieves'tools(player need to have in your inventary).
* If the player closes this dialog and the lock has a trap, it will be fired.
* If the player succeeds in the strength check, the lock will break and will not activate the trap. Otherwise it cannot open lock and if it has a trap it will be activated.
* If the player succeeds in the dexterity check (with tool), the lock will **not** break and will not activate the trap. Otherwise it cannot open lock and if it has a trap it will be activated.
* A trap is considered disarmed when the "Action Type" field of the lock is empty, otherwise it is considered an active trap.

## Future Features
* Expand to Close doors.

## Support
If you like this module and would like to help or found a bug or request new features call me on discord @Innocenti#1455 or create a issue here.

## License
This Foundry VTT module, writen by Innocenti, is licensed under a Creative Commons Attribution 4.0 International License.
