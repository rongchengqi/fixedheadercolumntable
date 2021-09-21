// only support for thead/tbody
// tested on Chrome
// author RongChengqi

(function ($) {
  $.fn.fixedheadercolumntable = function (options) {
    var defaults = {
      fixedColumnCount  : 0,// if this is not be set, will not fix column
      tableMaxHeight    : 0,
      tableMaxWidth     : 0, //this will be work only when responsive is false.
      fixedHeader       : true, // when true,will auto get fixed header row count from table header trs.
      adjustWHSettings  : {
      	   addLeftWidth        :0,
      	   addTopHeight        :0,
      	   addRightTopWidth    :0,
      	   addLeftBottomHeight :0
      },
      submitEreas       : {
      	   leftTop      :false,
      	   leftBottom   :false,
      	   rightTop     :false,
      	   rightBottom  :true
       },
      submitSelector    : "a,input,select,textarea"
    };

    var baseBigTableHtml =
      '<table class="alltbl" style="overflow:hidden;position:relative" cellspacing="0" cellpadding="0" border="0" >' +
      '<tr><td class="leftTopTd"><div class="leftTopContainer container" style="padding:0;overflow:hidden;position:relative"></div></td>' +
      '<td class="rightTopTd"><div class="rightTopContainer container" style="padding:0;overflow:hidden;position:relative"></div></td></tr>' +
      '<tr><td valign="top"  class="leftBottomTd"><div class="leftBottomContainer container" style="padding:0;position:relative;overflow: hidden;"></div></td>' +
      '<td valign="top" class="rightBottomTd"><div class="rightBottomContainer container" style="padding:0;overflow: auto;position:relative;height:auto"></div></td></tr></table>';

    var settings = {};

    /////////helperMethods//////
    var methods = {
      resize: function (options) {},
      init: function (options) {
        settings = $.extend({}, defaults, options);
        this.each(function () {
          var $table = $(this); // reference the jQuery version of the current DOM element
          $table.data("tableMaxHeight",settings.tableMaxHeight);
          $table.data("tableMaxWidth",settings.tableMaxWidth);
          $table.data("fixedColumnCount",settings.fixedColumnCount);

          if (helperMethods._isValidTable($table)) {
          	  if(!helperMethods._canScroll($table)){
          	  	  return;
          	  }
            helperMethods._resetSettings($table);
            var $allTbl = $(baseBigTableHtml);
            helperMethods._setFixedContainer($allTbl,$table);
			helperMethods._setEreaMarkOfTable($table);
            helperMethods._fill($table, $allTbl);

            $table.before($allTbl);
            helperMethods._setSubmitErea($allTbl);
            helperMethods._resetWidthHeight($allTbl);
            helperMethods._resetRbcScrollBar($allTbl);
              
            $table.remove();

          } else {
            $.error("Invalid table mark-up");
          }
        });

        helperMethods._resize();
      },
    };
    var helperMethods = {
    	 _canScroll: function ($table) {
    	 	var tw = parseInt($table.css("width"));
	        var th = parseInt($table.css("height"));
	        if(settings.tableMaxHeight >= th && settings.tableMaxWidth >= tw){
	        	return false;
	        }
	        if (settings.tableMaxHeight > th || settings.tableMaxHeight <= 0)  {
	           $table.data("tableMaxHeight",th);
	        }
	        if (settings.tableMaxWidth > tw  || settings.tableMaxWidth <= 0) {
	           $table.data("tableMaxWidth",tw);
	        }
            return true;
    	 },
      _isValidTable: function ($table) {
        var hasTable = $table.is("table"),
        hasThead = $table.find(">thead").length > 0,
        hasTbody = $table.find(">tbody").length > 0;

        if (hasTable && hasThead && hasTbody) {
          return true;
        }
        return false;
      },
      _resetSettings: function ($table) {
        if (settings.fixedColumnCount < 0) settings.fixedColumnCount = 0;
		var columnCount = $table
              .find(">thead >tr:nth-child(1) > td").length > 0 ? $table
              .find(">thead >tr:nth-child(1) > td").length : $table
              .find(">thead >tr:nth-child(1) > th").length;
        if(settings.fixedColumnCount > columnCount){
        	$table.data("fixedColumnCount",0);
        }
      },
       _getObj : function(objs) {
                for (var i = 0; i < objs.length; i++) {
                    if (objs[i].length > 0) {
                        return objs[i];
                    }
                }
        },
       _setEreaMarkOfSelector : function($originalTable,selector,types) {
       	    $originalTable.find(selector).each(
	 		   function(){
	 			  var tds = helperMethods._getObj([$(this).find(">td"),$(this).find(">th")]);
	 			  tds.each(function(n) {
	 			  	    if(types.length == 2){
	 			  	     	 if(n < parseInt($originalTable.data("fixedColumnCount"))){
	 			  	     	 	 $(this).addClass(types[0]);
		 			  	     }else{
		 			  	     	 $(this).addClass(types[1]);
		 			  	     }
	 			  	     }else{
	 			  	     	$(this).addClass(types[0]);
	 			  	     }
	 			    });
	 	     });
       },
      _setEreaMarkOfTable : function($originalTable) {
      	    var fixType = helperMethods._getFixType($originalTable);
	 		if (fixType === "full") {
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>thead>tr',["leftTop","rightTop"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tbody>tr',["leftBottom","rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tfoot>tr',["leftBottom","rightBottom"]);
	        } else if (fixType === "topbottom") {
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>thead>tr',["rightTop"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tbody>tr',["rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tfoot>tr',["rightBottom"]);
	        } else if (fixType === "leftright") {
				helperMethods._setEreaMarkOfSelector($originalTable,'>thead>tr',["leftBottom","rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tbody>tr',["leftBottom","rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tfoot>tr',["leftBottom","rightBottom"]);
	        }else{
            	helperMethods._setEreaMarkOfSelector($originalTable,'>thead>tr',["rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tbody>tr',["rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tfoot>tr',["rightBottom"]);
	        }
      },
  	 _setSubmitErea : function($allTbl) {
  	 	  var ses    = {
      	   leftTop      :false,
      	   leftBottom   :false,
      	   rightTop     :false,
      	   rightBottom  :true
          }
  	 	  for(var key in settings.submitEreas){
  	 	  	  ses[key] = settings.submitEreas[key];
  	 	  }
  	 	 
          for(var prop in ses){
             if(ses[prop] === false){
            	var container = $allTbl.find("."+ prop + "Container");
            	if(container.length > 0){
            		container.find(settings.submitSelector).attr('id', '').attr('name', '').addClass("")
            		.attr("disabled","disabled");
            	}
             }else{
            	var container = $allTbl.find("."+prop + "Container");
            	if(container.length > 0){
            		container.find("td,th").not("." + prop).find(settings.submitSelector).attr('id', '').attr('name', '').addClass("")
            		.attr("disabled","disabled");
            	}
             }
           }
        },
       _resetWidthHeight : function($allTbl) {
      	   	   var $lbc =  $allTbl.find(".leftBottomContainer"), $ltc =  $allTbl.find(".leftTopContainer"),
		       $rbc =  $allTbl.find(".rightBottomContainer"), $rtc =  $allTbl.find(".rightTopContainer"),
		       $lbt =  $allTbl.find(".leftBottomTd"), $ltt =  $allTbl.find(".leftTopTd"),
		       $rbt =  $allTbl.find(".rightBottomTd"), $rtt =  $allTbl.find(".rightTopTd");
        		 
      	   	   var lw = settings.adjustWHSettings.addLeftWidth || 0;
      	   	   var rtw = settings.adjustWHSettings.addRightTopWidth || 0;
      	   	   var lbh = settings.adjustWHSettings.addLeftBottomHeight || 0;
      	   	   var th = settings.adjustWHSettings.addTopHeight || 0;
      	   	   if(lw != 0){
      	   	   	  var lbw = parseInt($lbc.css("width"));
      	   	   	  var _rtw = parseInt($rtc.css("width"));
                  var lpx = lbw + lw + 'px';
                  var rtpx = _rtw - lw + 'px';
      	   	   	  $lbc.css("width",lpx);
      	   	   	  $lbt.css("width",lpx );
      	   	   	  $ltc.css("width",lpx);
      	   	   	  $ltt.css("width",lpx );
      	   	   	     
      	   	   	  $rtc.css("width",rtpx);
      	   	   	  $rtt.css("width",rtpx );
      	   	   	    
      	   	   	  var rbw = parseInt($rbc.css("width"));
      	   	   	  var rbpx = rbw - lw + 'px';
      	   	   	  $rbc.css("width",rbpx);
      	   	   	  $rbt.css("width",rbpx );
      	   	   	  $rbc.find(">table").css("left",-(lbw + lw) + 'px');
      	   	   	  $rtc.find(">table").css("left",-(lbw + lw) + 'px');

      	   	   }
      	   	   if(th != 0){
      	   	   	  var rth = parseInt($rtc.css("height"));
      	   	   	  var __lbh = parseInt($lbc.css("height"));
                  var rpx = rth + th + 'px';
                  var lbpx = __lbh - th + 'px';
      	   	   	  $rtc.css("height",rpx);
      	   	   	  $rtt.css("height",rpx );
      	   	   	  $ltc.css("height",rpx);
      	   	   	  $ltt.css("height",rpx );
      	   	   	  $lbc.css("max-height",lbpx);
      	   	   	  $lbt.css("max-height",lbpx );
      	   	   	    
      	   	   	  var rbh = parseInt($rbc.css("height"));
      	   	   	  var rbpx = rbh - th + 'px';
      	   	   	  $rbc.css("max-height",rbpx);
      	   	   	  $rbt.css("max-height",rbpx );
      	   	   }
      	   	   if(rtw != 0){
      	   	   	    var _rtw = parseInt($rtc.css("width"));
      	   	   	    $rtc.css("width",rtw + _rtw + 'px');
      	   	   	    $rtt.css("width",rtw + _rtw + 'px' );
      	   	   }
      	   	   if(lbh != 0){
      	   	   	    var _lbh = parseInt($lbc.css("height"));
      	   	   	    $lbc.css("height",lbh + _lbh + 'px');
      	   	   	    $lbt.css("height",lbh + _lbh + 'px' );
      	   	   }
       },
      _resetRbcScrollBar: function ($allTbl) {
          var $rbc = $allTbl.find(".rightBottomContainer");
	      var lw = parseInt($allTbl.attr("leftWidth")) + settings.adjustWHSettings.addLeftWidth || 0;
	      var th = parseInt($allTbl.attr("topHeight")) + settings.adjustWHSettings.addTopHeight || 0;
	      var tableMaxHeight = parseInt($rbc.find("> table").data("tableMaxHeight"));
          var tableMaxWidth = parseInt($rbc.find("> table").data("tableMaxWidth"));
          $rbc.css("width", tableMaxWidth- lw + ($rbc[0].offsetWidth - $rbc[0].clientWidth)+4 + 'px');
          $rbc.css("max-height", tableMaxHeight -th + ($rbc[0].offsetHeight - $rbc[0].clientHeight)+4 + "px");
      },
      _getFixType: function ($table) {
        if (settings.fixedHeader) {
          if (parseInt($table.data("fixedColumnCount")) > 0) {
            return "full";
          } else {
            return "topbottom";
          }
        } else {
          if (parseInt($table.data("fixedColumnCount")) > 0) {
            return "leftright";
          }else{
          	return "right";
          }
        }
      },
      _setFixedContainer: function ($allTbl,$table) {
      	var fixType = helperMethods._getFixType($table);
        var id = String(Math.random()).substr(2);
        $allTbl.attr("id", id);
        if (fixType === "full") {
        } else if (fixType === "topbottom") {
          $allTbl.find(".leftTopTd").remove();
          $allTbl.find(".leftBottomTd").remove();
        } else if (fixType === "leftright") {
          $allTbl.find(".leftTopTd").remove();
          $allTbl.find(".rightTopTd").remove();
        }else{
          $allTbl.find(".leftBottomTd").remove();
          $allTbl.find(".leftTopTd").remove();
          $allTbl.find(".rightTopTd").remove();
        }
      },
      _resize: function () {
      	//todo
        //window.onresize = function () {
        //};
      },
      _fill: function ($originalTable, $allTbl) {
      	 var tableMaxHeight = parseInt($originalTable.data("tableMaxHeight"));
         var tableMaxWidth = parseInt($originalTable.data("tableMaxWidth"));
         var fixedColumnCount = parseInt($originalTable.data("fixedColumnCount"));

        $originalTable.css("position", "relative");
        var fullWidth = parseInt($originalTable.outerWidth());
        var fullHeight = parseInt($originalTable.outerHeight());
        var fixedHeaderRowCount = settings.fixedHeader ? $originalTable.find("> thead > tr").length || 0 : 0;
        var leftWidth = 0,topHeight = 0;
        for (var i = 1; i <= fixedColumnCount; i++) {
        	var $cell = $originalTable
              .find(">thead >tr:nth-child(1) > td:nth-child(" + i + ")").length > 0 ? $originalTable
              .find(">thead >tr:nth-child(1) > td:nth-child(" + i + ")") : $originalTable.find(">thead >tr:nth-child(1) > th:nth-child(" + i + ")")
	          leftWidth += parseInt(
	            $cell.outerWidth(true)
	          );
        }
        for (var j = 1; j <= fixedHeaderRowCount; j++) {
          topHeight += parseInt(
            $originalTable.find(">thead >tr:nth-child(" + j + ")").outerHeight(true)
          );
        }

        var $lbc =  $allTbl.find(".leftBottomContainer"), $ltc = $allTbl.find(".leftTopContainer"),
        $rbc =  $allTbl.find(".rightBottomContainer"), $rtc = $allTbl.find(".rightTopContainer"),
        $lbt =  $allTbl.find(".leftBottomTd"), $ltt = $allTbl.find(".leftTopTd"),
        $rbt =  $allTbl.find(".rightBottomTd"), $rtt = $allTbl.find(".rightTopTd");
        
        var lwpx = leftWidth + "px";
        $allTbl.attr("leftWidth",leftWidth).attr("topHeight",topHeight);
        
        if (leftWidth > 0) {
            $lbt.css("width", lwpx);$ltt.css("width", lwpx)
            $lbc.css("width", lwpx).html($originalTable.clone());
            if(topHeight > 0){
              $ltc.css("width", lwpx).css("height", topHeight + "px").html($originalTable.clone());
            }

            $lbt.css("max-height", tableMaxHeight -topHeight + "px");
            $lbc.css("max-height", tableMaxHeight -topHeight + "px");
          
            if(settings.fixedHeader)
	            $lbc.find("> table >thead >tr").remove();
        }
         var wpx =  tableMaxWidth-leftWidth + "px";
         $rbc.html($originalTable.clone(true));
         $rbc.css("width", tableMaxWidth-leftWidth + 'px');
         $rbt.css("width", wpx);
         $rbc.css("max-height", tableMaxHeight -topHeight + "px");
         
         $rtc.find(" > table").css("left", -leftWidth + "px");
         $rtt.css("width", wpx);$rtc.css("width", wpx);
         $rbc.find(" > table").css("left", -leftWidth + "px");
        if (topHeight > 0) {
            //$rtc.css("height", topHeight + "px").css("width", fullWidth - leftWidth + "px").html($originalTable.clone());
            $rtc.css("height", topHeight + "px").html($originalTable.clone())
            $rbt.css("max-height", tableMaxHeight -topHeight + "px");
            if(settings.fixedHeader)
	           $rbc.find("> table >thead >tr").remove();
        }

          $allTbl.css("width", tableMaxWidth + "px");
        
        if($rbc.length > 0){
             $rbc.scroll(function(e) { 
                  if($rtc.length > 0 && $rbc.length > 0){
                        $rtc.scrollLeft($rbc.scrollLeft());
                   }
                   if($lbc.length > 0 && $rbc.length > 0){
                        $lbc.scrollTop($rbc.scrollTop());
                   }
             });
         } 
      },
    };

    return methods.init.apply(this, arguments);
  };

})(jQuery);
