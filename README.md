
![GitHub All Releases](https://img.shields.io/github/downloads/rinnocenti/innocenti-openlock/total)
![GitHub Releases](https://img.shields.io/github/downloads/rinnocenti/innocenti-openlock/0.1.0/total)
# Innocenti OpenLock
A simple module to use loot actors and it will be possible to configure traps and locks.
It was created for testing and learning purposes with foundry vtt
# Installation
You can install this module by using the following manifest URL : https://raw.githubusercontent.com/rinnocenti/innocenti-openlock/main/module.json

As GM go to the Manage Modules options menu in your World Settings tab then enable the Innocenti-OpenLock.

# Dependencies
This module was created to work in a world with other support modules so you don't have to increase your workload.
The module is system dependent:
  * System Dnd5 (v. 0.98)

And the Modules:
* Furnace (by kakaroto) for advanced macros: https://github.com/kakaroto/fvtt-module-furnace
* Midi QoL (by tposney) for damage Workflow: https://gitlab.com/tposney/midi-qol/raw/master/package/module.json
* Loot Sheet npc5e (by ChalkOne) for loot sheet: https://raw.githubusercontent.com/jopeek/fvtt-loot-sheet-npc-5e/master/module.json

# How to Use
the module basically works with the loot sheet with the character's target and macro activation.

1) Create an NPC using the loot sheet.

2) Create an item of type **Feat** and rename for "Lock" (or another word configured in the module settings).If you have a trap, set the damage and the actions in this item as well. If you select an **Action Type** it will recognize this trapped lock, if empty it will consider that there are no traps.
 You can also define a key for this lock in the **Requirements** field by entering the name of the item that will serve as the key for it. If the player has an item with the same name, he can open the chest without problems and without activating traps.

3) In **"Activation Conditions"** of your Lock, you will configure the difficulty classes to find and defuse traps as follows:
There are 4 CDs to be configured* according to the following template: name_space_ND_point and comma (name #; see picture)
accepted parameters are:
prc ##; For the perception check to find traps.
str ##; For strength check to break the lock
dex ##; For dexterity check (with tool) to open the lock
disarm ##; for dexterity check (with tool) to disarm the trap
\* *It is configured like this until I create another simpler way to do it*

4) Place the "Lock" object on the loot sheet.

5) Create two macros with permission for all your players with the following content:
macro1 - FIND TRAP 
`let checkchest = InnocentiOpenLock.CheckTraps();`
macro2 - OPEN CHEST
`let openchest = InnocentiOpenLock.Chest();`

6)The player must aim at the token of the chest and choose one of the macro actions.

## Find Trap
Find Trap will test the passive perception of the player against the DC value set in "prc", to identify if there is a trap.

If the passive perception does not reach the DC, the player will be asked for a perception check.

Then a dialog with the option to open the chest (see Open Chest), if you succeed in any of the perception tests the option to "disarm the trap" will appear (player need to have the thieves'tools in your inventary).

A chat card will be created with the results, including the indication if player has the key (if the lock has one, the player has the correct one and passed the perception test for looking for).

## Open Chest
* Makes an attempt to open the chest.
* If the player has permission for that chest or has the key to it, the chest will be opened immediately. Otherwise, a dialog will be displayed for ways to open the chest, using stranght check or using thieves'tools(player need to have in your inventary).
* If the player closes this dialog and the lock has a trap, it will be fired.
* If the player succeeds in the strength check, the lock will break and will not activate the trap. Otherwise it cannot open lock and if it has a trap it will be activated.
* If the player succeeds in the dexterity check (with tool), the lock will **not** break and will not activate the trap. Otherwise it cannot open lock and if it has a trap it will be activated.
* A trap is considered disarmed when the "Action Type" field of the lock is empty, otherwise it is considered an active trap.

# Future Features
* Improve DC settings on items
* Expand to Close doors.
* Major check failures (<5) can break the items involved or set a trap.

# Support
If you like this module and would like to help or found a bug or request new features call me on discord or create a issue here.

# License
This Foundry VTT module, writen by Innocenti, is licensed under a Creative Commons Attribution 4.0 International License.

This work is licensed under Foundry Virtual Tabletop EULA - Limited License Agreement for module development v 0.1.6.
