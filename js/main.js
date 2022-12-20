/*
Name: Albert Levin                                                                                                                                      
Date: 12/19/22    
*/

// To update the User's total score
var totalUserScore;

// To generate the board and start a new game
function gamePlay() {
    // Calls the scrabbleBoard function to generate a new board
    scrabbleBoard();
    // Calls the resetButton function so it can reset the game and display the remaining letters table
    resetButton();
    // Calls the Tiles function so it can generate tiles
    Tiles();
    // Calls the Draggable/Droppable functions (jQuery UI)
    DragAndDrop();
}

// Source: https://stackoverflow.com/questions/19408082/differences-between-document-readyfunction-and-document-onready

$(document).on("ready", function() {
    // Calls the gamePlay function (from above) to start a new game
    gamePlay();

    // Reset Board button
    // Source: https://stackoverflow.com/questions/67479850/trying-to-rewrite-a-deprecated-jquery-function-fn-click
    $("#reset").on("click", function() {
        resetButton();
        DragAndDrop();
    });

    $("#returnTiles").on("click", function() {
        returnTilesToRack();
        DragAndDrop();
    });

    $("#endturn").on("click", function() {
        endTurnButton();
        shuffleTiles();
        DragAndDrop();
    });
});

// Resets the game and displays the remaining letters table
function resetButton() {
    var lettersArray = "_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 0; i < lettersArray.length; i++) {
        ScrabbleTiles[lettersArray[i]].numberRemaining = ScrabbleTiles[lettersArray[i]].originalDistribution;
    }
    totalUserScore = 0;
    scrabbleBoard();
    Tiles();
    updateRemainingLetterTable();
}

// To check if the word is valid or not
function endTurnButton() {
    var score = totalUserScore;
    $("#scoreID").html(score);
    scrabbleBoard();
    return totalUserScore;
}

// To generate a new board
function scrabbleBoard() {
    var table = ""; // Initializes a new table variable
    $("#scrabbleBoard").html(table);
    table += '<table id="singleLine">';

    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';
    table += '<td class="doubleLetter regular">DOUBLE<br>LETTER<br>SCORE</td>';
    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';
    table += '<td class="doubleLetter regular">DOUBLE<br>LETTER<br>SCORE</td>';
    table += '<td class="start regular">*<br>START</td>';
    table += '<td class="doubleLetter regular">DOUBLE<br>LETTER<br>SCORE</td>';
    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';
    table += '<td class="doubleLetter regular">DOUBLE<br>LETTER<br>SCORE</td>';
    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';
    table += '<td class="regular"></td>';

    table += "</table>";
    $("#scrabbleBoard").html(table);
    table = "";
}

// Calls the Draggable/Droppable functions (jQuery UI)
function DragAndDrop() {
    Draggable();
    Droppable();
}

// Sources for the Draggable method in jQueryUI: https://api.jqueryui.com/draggable/, https://www.tutorialspoint.com/jqueryui/jqueryui_draggable.htm, & https://www.geeksforgeeks.org/jquery-ui-draggable-and-droppable-methods/
function Draggable() {
    for (var i = 0; i < 7; i++) {
        $("#tile_drag_" + i).draggable({
            revert: "invalid", // The tiles can only be dragged from the “rack” to the Scrabble board. If the user drop them anywhere else, they will return back to the “rack."
            start: function(ev, ui) {
                startPos = ui.helper.position();
            },
            stop: function() {
                $(this).draggable("option", "revert", "invalid"); // Source: https://stackoverflow.com/questions/8168365/jquery-draggable-revert-function-cant-return-invalid
            },
        });
    }
}

// Sources for the Droppable method in jQueryUI: https://api.jqueryui.com/droppable/, https://www.tutorialspoint.com/jqueryui/jqueryui_droppable.htm, & https://www.geeksforgeeks.org/jquery-ui-draggable-and-droppable-methods/
function Droppable() {
    $("#scrabbleBoard td").droppable({
        accept: ".ui-draggable", // Source: https://stackoverflow.com/questions/1444469/jquery-droppable-accept
        tolerance: "intersect", // To ensure a draggable is hovering over a droppable. Source: https://stackoverflow.com/questions/34522298/how-to-get-custom-tolerance-effect-for-droppable
        revert: "invalid",
        drop: function(event, ui) {
            if ($(this).attr("id") == undefined) {
                $(this)[0].id = $(this)[0].id + " dropped";
                ui.draggable[0].style.cssText = "";
                var img = ui.draggable[0].outerHTML;

                var strID = String($(this)[0].id);
                var match = strID.match(/(.+)(dropped)/); // To make groups of substrings. Sources: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Backreferences & https://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression

                var newTD = '<td class="' + $(this)[0].className + '" id="' + match[2] + '">' + img + "</td>";

                // This will update the score for the User
                var getPieceLt = img.match(/board_piece_(\w)/);
                var scorePiece = ScrabbleTiles[getPieceLt[1]].value;

                if ($(newTD).hasClass("doubleLetter")) {
                    // To check whether these elements have the specified class name or not. Sources: https://api.jquery.com/hasclass/ & https://www.w3schools.com/jquery/html_hasclass.asp
                    totalUserScore = scorePiece + totalUserScore;
                }
                if ($(newTD).hasClass("regular")) {
                    totalUserScore = scorePiece + totalUserScore;
                }

                $(this)[0].outerHTML = newTD;

                ui.draggable[0].outerHTML = "";

                DragAndDrop();

                removeDraggableID();
            } else {
                // If the 'td' element already contains a letter, then the letter will automatically return back to the rack
                ui.draggable.draggable("option", "revert", true);
                return;
            }
        },
        out: function(event, ui) {},
    });

    // This allows the user the ability to drag tiles back to the Rack
    $("#Tiles td").droppable({
        accept: ".ui-draggable",
        drop: function(event, ui) {
            // Source: https://www.geeksforgeeks.org/jquery-ui-droppable-drop-event/
            rearrangeScrabbleBoard();
        },
        out: function(event, ui) {
            $(this).removeAttr("id"); // Sources: https://api.jquery.com/removeattr/ & https://www.bitdegree.org/learn/jquery-remove-attribute
        },
    });
}

// To rearrange the Scrabble Board
function rearrangeScrabbleBoard() {
    var rid = $("#scrabbleBoard").find("td"); // To get a table cell using jQuery. Sources: https://api.jquery.com/find/, https://www.w3schools.com/jquery/traversing_find.asp, & https://stackoverflow.com/questions/376081/how-to-get-a-table-cell-value-using-jquery
    rid.each(function() {
        if (String($(this)[0].id) === "dropped") $(this).removeAttr("id");
    });
}

function removeID() {
    var rid = $("#scrabbleBoard").find("td");
    rid.each(function() {
        var strID = String($(this).attr("id"));
        if (strID.indexOf("dropped") > -1) {
            $(this).removeAttr("id");
        }
    });
}

function removeDraggableID() {
    var rid = $("#scrabbleBoard").find("td");

    // This will loop through each 'td' data cell in the Letters Remaining table
    rid.each(function() {
        if ($(this)[0].childElementCount == 0 && $(this)[0].id != "") {
            $(this).removeAttr("id");
        }
    });
}

function updateRemainingLetterTable() {
    var remainingWord = "";
    $("#remainingTiles").html(remainingWord);

    remainingWord += '<table class="remainword">';

    // Creating the first row in the Letters Remaining table
    remainingWord += '<tr><td class="remainingLetter" colspan="9">Letters Remaining</td></td>';

    // Creating the second row in the Letters Remaining table
    remainingWord += '<tr><td class="remainingLetter">' + "A: " + ScrabbleTiles["A"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "B: " + ScrabbleTiles["B"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "C: " + ScrabbleTiles["C"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "D: " + ScrabbleTiles["D"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "E: " + ScrabbleTiles["E"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "F: " + ScrabbleTiles["F"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "G: " + ScrabbleTiles["G"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "H: " + ScrabbleTiles["H"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "I: " + ScrabbleTiles["I"].numberRemaining + "</td></td>";

    // Creating the third row in the Letters Remaining table
    remainingWord += '<tr><td class="remainingLetter">' + "J: " + ScrabbleTiles["J"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "K: " + ScrabbleTiles["K"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "L: " + ScrabbleTiles["L"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "M: " + ScrabbleTiles["M"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "N: " + ScrabbleTiles["N"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "O: " + ScrabbleTiles["O"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "P: " + ScrabbleTiles["P"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "Q: " + ScrabbleTiles["Q"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "R: " + ScrabbleTiles["R"].numberRemaining + "</td></td>";

    // Creating the fourth row in the Letters Remaining table
    remainingWord += '<tr><td class="remainingLetter">' + "S: " + ScrabbleTiles["S"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "T: " + ScrabbleTiles["T"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "U: " + ScrabbleTiles["U"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "V: " + ScrabbleTiles["V"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "W: " + ScrabbleTiles["W"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "X: " + ScrabbleTiles["X"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "Y: " + ScrabbleTiles["Y"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "Z: " + ScrabbleTiles["Z"].numberRemaining + "</td>";
    remainingWord += '<td class="remainingLetter">' + "_: " + ScrabbleTiles["_"].numberRemaining + "</td></td>";

    remainingWord += "</table>";

    $("#remainingTiles").html(remainingWord); // This will return the innerHTML content of the selected element. Source: https://stackoverflow.com/questions/1309452/how-to-replace-innerhtml-of-a-div-using-jquery
}

var Rack = [];
var lettersArray = "_ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// To play a new Scrabble game, this Tiles function allows for 7 letters on the rack at a time
function Tiles() {
    Rack = [];
    var tile = "";
    tile += '<table id="TilesRack"><tr>';
    for (var i = 0; i < 7; i++) {
        // Get a random item (tile) from a JavaScript array
        // Sources: https://www.programiz.com/javascript/examples/get-random-item, https://css-tricks.com/snippets/javascript/select-random-item-array/, & https://www.tutorialspoint.com/javascript-how-to-pick-random-elements-from-an-array
        var index = Math.floor(Math.random() * lettersArray.length);

        // This will loop through the array to see if there is any letters remaining
        while (ScrabbleTiles[lettersArray[index]].numberRemaining === 0) {
            index = Math.floor(Math.random() * lettersArray.length);
        }
        // This will obtain each of the Scrabble_Tile_ images (.jpg)
        var tileLetters = "images/Scrabble_Tile_" + lettersArray[index] + ".jpg";
        tile += "<td><img id='tile_drag_" + i + "' class='board_piece_" + lettersArray[index] + "' src='" + tileLetters + "'></img></td>";

        ScrabbleTiles[lettersArray[index]].numberRemaining = ScrabbleTiles[lettersArray[index]].numberRemaining - 1;

        Rack.push({
            // Appends values to the end of the array. Sources: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push & https://www.w3schools.com/jsref/jsref_push.asp
            lettersArray: lettersArray[index],
            id: "dragTile_" + i,
            value: ScrabbleTiles[lettersArray[index]].value,
        });
    }
    tile += "</tr></table>";
    $("#scoreID").html(totalUserScore);
    $("#Tiles").html(tile);
    // This will call the updateRemainingLetterTable function so the user know how many tiles we have at the beginning
    updateRemainingLetterTable();
}

// After the User clicks on the Shuffle Tiles button, the shuffleTiles function will generate random tiles back onto the Rack
function shuffleTiles() {
    var rackID = $("#scrabbleBoard").find("td");
    rackID.each(function() {
        if ($(this)[0].id == "dropped") {
            $(this)[0].innerHTML = "";
            removeDraggableID();
        }
    });
    for (var i = 0; i < Rack.length; i++) {
        var letter = Rack[i].lettersArray;
    }

    Tiles();
    DragAndDrop();
}

// After the User clicks on the Return Tiles button, the returnTilesToRack function will return the Tiles back to the Rack
function returnTilesToRack() {
    var tile = "";
    var i,
        j = 0;
    var rackID = $("#scrabbleBoard").find("td");
    rackID.each(function() {
        if (String($(this)[0].id) === "dropped") {
            $(this).removeAttr("id");
            $(this)[0].firstChild.outerHTML = "";
        }
    });
    tile += '<table id="TilesRack"><tr>';
    rackID = $("#Tiles").find("td");
    for (i = 0; i < rackID.length; i++) {
        if (i < rackID.length) {
            var index = Rack[j].lettersArray;
            // This will obtain each of the Scrabble_Tile_ images (.jpg)
            var tileLetters = "images/Scrabble_Tile_" + index + ".jpg";
            tile += "<td><img id='tile_drag_" + i + "' class='board_piece_" + index + "' src='" + tileLetters + "'></img></td>";
            j++;
        } else {
            tile += "<td></td>";
        }
    }
    tile += "</tr></table>";
    $("#Tiles").html(tile);
}
