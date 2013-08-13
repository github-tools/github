$.browser = {webkit: true};

$(function () {
  var jqconsole = $('#console').jqconsole('Hello. You can start by pasting the code above into the prompt below!\n', '>>> ');
  var startPrompt = function () {
    // Start the prompt with history enabled.
    jqconsole.Prompt(true, function (input) {
      // Output input with the class jqconsole-output.
      try {
        var ret = eval(input);
        if (ret && ret.promise) {
          ret
          .fail(function(json) {
            jqconsole.Write(JSON.stringify(json.error) + '\n', 'jqconsole-error');
          })
          .done(function(json) {
            var str = JSON.stringify(json, null, '  ');
            if (str.length > 5000) {
              str = str.slice(0, 5000) + ' ...';
            }
            jqconsole.Write(str + '\n', 'jqconsole-output');
          });
        } else {
          jqconsole.Write(ret + '\n', 'jqconsole-output');
        }

      } catch (e) {
        jqconsole.Write(JSON.stringify(e.message) + '\n', 'jqconsole-error');
      }

      // Restart the prompt.
      startPrompt();
    });
  };
  startPrompt();
});
