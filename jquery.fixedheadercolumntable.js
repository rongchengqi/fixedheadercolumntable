// only support for thead/tbody
// tested on Chrome
// author RongChengqi

(function ($) {
  $.fn.fixedheadercolumntable = function (options) {
    var defaults = {
      fixedColumnCount: 2,// if this is not be set, will not fix column
      	    tableMaxHeight:    100,
            tableMaxWidth:      200, //this will be work only when responsive is false.
      fixedHeader: true, // when true,will auto get fixed header row count from table header trs.
      adjustWHSettings : {
      	   addLeftWidth:0,
      	   addTopHeight:0
      	   ,addRightTopWidth:0
      	   ,addLeftBottomHeight:0
      	   },
          submitEreas : {leftTop:false,leftBottom:false,rightTop:false,rightBottom:true},
          submitSelector : "a,input,select,textarea"
    };

    var baseBigTableHtml =
      '<table class="alltbl" style="overflow:hidden;position:relative" cellspacing="0" cellpadding="0" border="0" >' +
      '<tr><td class="leftTopTd"><div class="leftTopContainer container" style="overflow:hidden;position:relative"></div></td>' +
      '<td class="rightTopTd"><div class="rightTopContainer container" style="overflow:hidden;position:relative"></div></td></tr>' +
      '<tr><td valign="top"  class="leftBottomTd"><div class="leftBottomContainer container" style="position:relative;overflow: hidden;"></div></td>' +
      '<td valign="top" class="rightBottomTd"><div class="rightBottomContainer container" style="overflow: auto;position:relative;height:auto"></div></td></tr></table>';

    var settings = {};

    /////////helperMethods//////
    var methods = {
      resize: function (options) {},
      init: function (options) {
        settings = $.extend({}, defaults, options);

        // iterate through all the DOM elements we are attaching the plugin to
        this.each(function () {
          var $table = $(this); // reference the jQuery version of the current DOM element

          if (helperMethods._isValidTable($table) && helperMethods._canScroll($table)) {
            // helperMethods.setup.apply(this, Array.prototype.slice.call(arguments, 1));
            // $.isFunction(settings.create) && settings.create.call(this);
            helperMethods._resetSettings($table);

            var $allTbl = $(baseBigTableHtml);
            //$allTbl.data("originalTable", $table.clone(true));
            helperMethods._setFixedContainer($allTbl);
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
	        if (settings.tableMaxHeight > th)  {
	          settings.tableMaxHeight = th;
	        }
	        if (settings.tableMaxWidth > tw)  settings.tableMaxWidth = tw;
	        
            return true;
    	 },
      _isValidTable: function ($table) {
        var hasTable = $table.is("table"),
        hasThead = $table.find("thead").length > 0,
        hasTbody = $table.find("tbody").length > 0;

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
        	settings.fixedColumnCount = 0;
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
       	    $originalTable.find('>thead>tr').each(
	 		   function(){
	 			  var tds = helperMethods._getObj([$(this).find(">td"),$(this).find(">th")]);
	 			  tds.each(function(n) {
	 			  	    if(types.length == 2){
	 			  	     	 if(n < settings.fixedColumnCount){
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
	 		if (settings.fixType === "full") {
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>thead>tr',["leftTop","rightTop"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tbody>tr',["leftBottom","rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tfoot>tr',["leftBottom","rightBottom"]);
	        } else if (settings.fixType === "topbottom") {
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>thead>tr',["rightTop"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tbody>tr',["rightBottom"]);
	 			helperMethods._setEreaMarkOfSelector($originalTable,'>tfoot>tr',["rightBottom"]);
	        } else if (settings.fixType === "leftright") {
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
          for(var prop in settings.submitEreas){
             if(settings.submitEreas[prop] === false){
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
        		 
      	   	   var lw = settings.adjustWHSettings.addLeftWidth;
      	   	   var rtw = settings.adjustWHSettings.addRightTopWidth;
      	   	   var lbh = settings.adjustWHSettings.addLeftBottomHeight;
      	   	   var th = settings.adjustWHSettings.addTopHeight;
      	   	   
      	   	   if(lw != 0){
      	   	   	  var lbw = parseInt($lbc.css("width"));
      	   	   	  var rtw = parseInt($rtc.css("width"));
                  var lpx = lbw + lw + 'px';
                  var rtpx = rtw - lw + 'px';
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
      	   	   	  var lbh = parseInt($lbc.css("height"));
                  var rpx = rth + th + 'px';
                  var lbpx = lbh - th + 'px';
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
      	   	   	 // $rbc.find(">table").css("top",-(rth + th) + 'px');
      	   	   	  //$lbc.find(">table").css("top",-(rth + th) + 'px');
      	   	   }
      	   	   if(rtw != 0){
      	   	   	    var _rtw = parseInt($rtc.css("width"));
      	   	   	    $rtc.css("with",rtw + _rtw + 'px');
      	   	   	    $rtt.css("with",rtw + _rtw + 'px' );
      	   	   }
      	   	   if(lbh != 0){
      	   	   	    var _lbh = parseInt($lbc.css("height"));
      	   	   	    $lbc.css("with",lbh + _lbh + 'px');
      	   	   	    $lbt.css("with",lbh + _lbh + 'px' );
      	   	   }
       },
      _resetRbcScrollBar: function ($allTbl) {
          var $rbc = $allTbl.find(".rightBottomContainer");
	      var lw = parseInt($allTbl.attr("leftWidth")) + settings.adjustWHSettings.addLeftWidth;
	      var th = parseInt($allTbl.attr("topHeight")) + settings.adjustWHSettings.addTopHeight;
          $rbc.css("width", settings.tableMaxWidth- lw + ($rbc[0].offsetWidth - $rbc[0].clientWidth) + 'px');
          $rbc.css("max-height", settings.tableMaxHeight -th + ($rbc[0].offsetHeight - $rbc[0].clientHeight) + "px");
      },
      _setFixType: function () {
        if (settings.fixedHeader) {
          if (settings.fixedColumnCount > 0) {
            settings.fixType = "full";
          } else {
            settings.fixType =  "topbottom";
          }
        } else {
          if (settings.fixedColumnCount > 0) {
            settings.fixType = "leftright";
          }else{
          	  settings.fixType = "right"
          }
        }
      },
      _setFixedContainer: function ($allTbl) {
      	helperMethods._setFixType();
        var id = String(Math.random()).substr(2);
        $allTbl.attr("id", id);
        if (settings.fixType === "full") {
        } else if (settings.fixType === "topbottom") {
          $allTbl.find(".leftTopTd").remove();
          $allTbl.find(".leftBottomTd").remove();
        } else if (settings.fixType === "leftright") {
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
        $originalTable.css("position", "relative");
        var fullWidth = parseInt($originalTable.outerWidth());
        var fullHeight = parseInt($originalTable.outerHeight());
        //auto set settings.fixedHeaderRowCount 
        settings.fixedHeaderRowCount = settings.fixedHeader ? $originalTable.find("> thead > tr").length || 0 : 0;
        var leftWidth = 0,topHeight = 0;
        for (var i = 1; i <= settings.fixedColumnCount; i++) {
        	var $cell = $originalTable
              .find(">thead >tr:nth-child(1) > td:nth-child(" + i + ")").length > 0 ? $originalTable
              .find(">thead >tr:nth-child(1) > td:nth-child(" + i + ")") : $originalTable.find(">thead >tr:nth-child(1) > th:nth-child(" + i + ")")
	          leftWidth += parseInt(
	            $cell.outerWidth(true)
	          );
        }
        for (var j = 1; j <= settings.fixedHeaderRowCount; j++) {
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

            $lbt.css("max-height", settings.tableMaxHeight -topHeight + "px");
            $lbc.css("max-height", settings.tableMaxHeight -topHeight + "px");
          
            for (var j = 1; j <= settings.fixedHeaderRowCount; j++) {
	            $lbc.find("> table >thead >tr:nth-child(" + j + ")").remove();
	        }
        }
         var wpx =  settings.tableMaxWidth-leftWidth + "px";
         $rbc.html($originalTable.clone(true));
         $rbc.css("width", settings.tableMaxWidth-leftWidth + 'px');
         $rbt.css("width", wpx);
         $rbc.css("max-height", settings.tableMaxHeight -topHeight + "px");

        if (topHeight > 0) {
            $rtc.css("height", topHeight + "px").css("width", fullWidth - leftWidth + "px").html($originalTable.clone());
            $rtc.find(" > table").css("left", -leftWidth + "px");
            $rtt.css("width", wpx);$rtc.css("width", wpx);
            $rbc.find(" > table").css("left", -leftWidth + "px");//.css("top", -topHeight + "px");
             for (var j = 1; j <= settings.fixedHeaderRowCount; j++) {
	            $rbc.find("> table >thead >tr:nth-child(" + j + ")").remove();
	        }
            $rbt.css("max-height", settings.tableMaxHeight -topHeight + "px");
        }

          $allTbl.css("width", settings.tableMaxWidth + "px");
        
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
