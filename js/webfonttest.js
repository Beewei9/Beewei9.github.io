var isIE = document.uniqueID;

$(function () {
  
  $("[class*=tag_]").each(function () {
    var classes = $(this).attr("class").split(" ");
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].match(/^tag_([^_]*)_?(\d+)?$/)) {
        var tagString = RegExp.$1;
        var tagIndex = RegExp.$2;
        if (!tagIndex) tagIndex = 1;
        var value = "'" + tagString + "' " + tagIndex;
        $(this).css({
            "font-feature-settings":         value,
            "-moz-font-feature-settings":    value,
            "-ms-font-feature-settings":     value,
            "-webkit-font-feature-settings": value,
        });
      }
    }
  });
  
  // カーソルを末尾に
  $("#textbox").focus();
  var textLength = $("#textbox").val().length;
  if (isIE) {
    var range = $("#textbox").get(0).createTextRange();
    range.move("character", textLength);
    range.select();
  } else {
    $("#textbox").get(0).setSelectionRange(textLength, textLength);
  }
  updateCharacter();
  
  $("#textbox").click(updateCharacter);
  
  // フォント設定
  setFont();
  $("input[name=font]").change(setFont);
});

function setFont() {
  $(".glyph").css("font-family", $("input[name=font]:checked").val());
}

function updateCharacter() {
  var index;
  if (isIE) {
    var docRange = document.selection.createRange();
    var range = $("#textbox").get(0).createTextRange();
    range.setEndPoint('EndToEnd', docRange);
    index = range.text.length;
  } else {
    index = $("#textbox").get(0).selectionEnd;
  }
  var codepoint = getCodepoint($("#textbox").val(), index);
  $("td").each(function () {
    $(this).html("&#" + codepoint + ";");
    var classes = $(this).attr("class").split(" ");
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].match(/^ivs_u([\da-f]{5})$/)) {
        $(this).html($(this).text() + "&#x" + RegExp.$1 + ";");
      }
    }
  });
}

function getCodepoint(text, index) {
  if (index <= 0) return 0x3000;
  var codepoint = text.charCodeAt(index - 1);
  if (0xdc00 <= codepoint && codepoint <= 0xdfff) { // is low surrogate
    codepoint = (text.charCodeAt(index - 2) - 0xd800) * 0x400
                 + (codepoint - 0xdc00) + 0x10000;
    if (0xe0100 <= codepoint && codepoint <= 0xe01ef) { // is variation selector supplement
      codepoint = getCodepoint(text, index - 2);
    }
  }
  return codepoint;
}