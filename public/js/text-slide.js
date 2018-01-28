var script_width;
var script_text_row_width;
var rowCharacterCount;

var script = ""

$(window).on('load', function(){
  script_width = $(".script-content").width();
  script_text_row_width = Number(script_font_size) + Number(script_letter_spacing) + 5;

  getRowCharacterCount();

  createScriptDom();


});

var span_list = [];
function createScriptDom() {

  var line_count = Math.floor(script.trim().length / rowCharacterCount);
  // console.log(line_count);

  var span_list = [];
  for(i=0; i<line_count; i++) {
    var span = $('<span/>');
    span.text(script.substring(i*rowCharacterCount,(i+1)*rowCharacterCount));
    span_list.push(span);
  }

  $(".script-ready").empty();
  $(".script-ready").append(span_list);
}


function changeScreenSize() {
  script_width = $(".script-content").width();
  getRowCharacterCount();
  createScriptDom();
}

function getRowCharacterCount() {
  rowCharacterCount = Math.floor((script_width + script_letter_spacing) / (0.885 * script_font_size + script_letter_spacing))
  console.log("word count: ", rowCharacterCount);
}

var last_row_num = 1;
var last_y_position = 0;
function changeScriptRow(position_seq) {

  // $(".script-ready").children[]
  // var calculated_seq = position_seq - (rowCharacterCount * (rowCount-1))
  // if (rowCharacterCount < calculated_seq) {


  var row_num = Math.ceil((position_seq+1) / rowCharacterCount);
  console.log("row_num: ", row_num);
  if (last_row_num != row_num) {

    var yposition = $(".script-ready").children("span:nth-child(" + row_num + ")").offset().top;
    console.log("yposition: ", yposition);
    document.getElementsByClassName("script-content")[0].scrollTo({left:0, top:last_y_position+ yposition, behavior: 'smooth'});
    last_row_num = row_num;
    last_y_position = last_y_position+ yposition;
  } else {

  }

    // document.getElementsByClassName("script-content")[0].scrollBy({left:0, top:script_line_height, behavior: 'smooth'});
    // rowCount += 1;
  // } else {
  //   // do nothing
  // }

}



var last_position=0;
const socket = io('http://49.236.144.16:8008');
socket.on("connect", function() {

	socket.emit("WebConnect", "sghiroo@naver.com");

	socket.emit("WebJoin", [1, "sghiroo@naver.com"]);

	socket.on("voice", function(data){
		console.log(data);

		if(data == "-1") {		

		} else if (last_position > data) {

		} else if (last_position < data - 30) {
		} else {					 
			last_position = Number(data);
			changeScriptRow(Number(data));
		}


	});

	socket.on("up", function(){
		last_position = last_position + rowCharacterCount
		position_seq = last_position
		changeScriptRow(last_position);
	});

	socket.on("down", function(){
		last_position = last_position - rowCharacterCount		
		position_seq = last_position
		changeScriptRow(last_position);
	});
//	socket.emit("leave", "data", function(data) {
//		console.log(data);
//	});
});
console.log(socket );
