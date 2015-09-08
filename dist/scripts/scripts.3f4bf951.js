"use strict";var app=angular.module("wrnApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","LocalStorageModule","ngQuill","FBAngular","chart.js"]);app.config(["localStorageServiceProvider",function(a){a.setPrefix("ls")}]),app.config(["ChartJsProvider",function(a){a.setOptions({bezierCurve:!1,scaleBeginAtZero:!0}),a.setOptions("Doughnut",{percentageInnerCutout:75}),Chart.defaults.global.colours=["#009E60","#DCDCDC","#D11565"],Chart.defaults.global.scaleFontFamily=["Josefin Sans","Helvetica Neue","Helvetica","Arial","sans-serif"],Chart.defaults.global.tooltipFontFamily=["Josefin Sans","Helvetica Neue","Helvetica","Arial","sans-serif"],Chart.defaults.global.scaleFontSize=16,Chart.defaults.global.tooltipFontSize=18}]),app.config(["$httpProvider",function(a){a.interceptors.push(["$q","localStorageService",function(a,b){return{request:function(a){return b.get("user")&&(a.headers.token=b.get("user").token,a.headers.email=b.get("user").email),a}}}])}]),app.config(["$routeProvider",function(a){a.when("/login",{templateUrl:"views/login.html",controller:"UserCtrl",controllerAs:"user"}).when("/register",{templateUrl:"views/register.html",controller:"UserCtrl",controllerAs:"user"}).when("/entries",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/entries/:id",{templateUrl:"views/entry.html",controller:"EntryCtrl",controllerAs:"entry",navigationClass:"fs-navbar"}).when("/stats",{templateUrl:"views/stats.html",controller:"StatsCtrl",controllerAs:"stats"}).otherwise({redirectTo:"/entries"})}]),app.controller("ViewCtrl",["$scope","$rootScope","$location",function(a,b,c){a.$on("$routeChangeSuccess",function(d,e,f){e.$$route&&(a.navigationClass=e.$$route.navigationClass),!b.currentUser&&e.$$route&&"/register"!==e.$$route.originalPath&&c.path("/login")})}]),app.controller("UserCtrl",["UserService","SessionService","Data","Stats","$location","$rootScope",function(a,b,c,d,e,f){var g=this;g.info={email:"kafka@gmail.com",password:"password"},f.currentUser=c.loadUser();var h=function(a){c.setUser(a),f.currentUser=a,e.path("/entries")},i=function(a){console.log("Error"+JSON.stringify(a))};g.logout=function(){c.clear(),f.currentUser=null,e.path("/login")},g.login=function(){c.clear(),b.login(g.info,h,i)},g.register=function(){a.users.save({user:g.info},h,i)},g.updateGoal=function(){c.updateUser(f.currentUser)}}]),app.controller("StatsCtrl",["Data","Stats","$scope",function(a,b,c){var d=this;a.loadEntries(function(a){d.dt=b.getStats(a),console.log(d.dt)})}]),app.controller("MainCtrl",["Data","Stats",function(a,b){var c=this;a.loadEntries(function(a){c.days=a})}]),app.controller("EntryCtrl",["$routeParams","$location","$scope","Data","Fullscreen",function(a,b,c,d,e){var f=this;f.countWords=function(){var a=f.currentEntry.content.replace(/<.*?>/g," ");return a.match(/\S+/g)?a.match(/\S+/g).length:0},f.updateEntry=function(){f.currentEntry.word_count=f.countWords(),f.currentEntry.progress=Math.round(f.currentEntry.word_count/f.currentEntry.goal*100),f.currentEntry.progress>=100&&f.displayModal?($("#successModal").modal("show"),f.displayModal=!1):f.currentEntry.progress<100&&(f.displayModal=!0),d.saveEntry(f.currentEntry)},f.toggleFullscreen=function(){e.isEnabled()?e.cancel():e.all(),f.editor.quill.setSelection(f.editor.length,f.editor.length)},c.$on("editorCreated",function(b,c){f.editor=c.editor;var e=new Date;d.getEntry({id:a.id},function(a){f.currentEntry=a,f.currentEntry.progress=Math.round(f.currentEntry.word_count/f.currentEntry.goal*100),f.displayModal=f.currentEntry.progress<100;var b=new Date(f.currentEntry.created_at);b.setHours(0,0,0,0)==e.setHours(0,0,0,0)&&(f.editor.enable(),f.editor.quill.setSelection(f.editor.length,f.editor.length))},function(a){console.log("Error"+JSON.stringify(a))})})}]);var APIURL="http://wrn-api.herokuapp.com";app.factory("EntryService",["$resource",function(a){return a(APIURL+"/api/entries/:id",{},{get:{method:"GET",cache:!1,isArray:!0},getEntry:{method:"GET",cache:!1,isArray:!1},update:{method:"PUT",cache:!1,isArray:!0}})}]),app.factory("UserService",["$resource",function(a){return{users:a(APIURL+"/api/users",{},{save:{method:"POST",cache:!1,isArray:!1}}),user:a(APIURL+"/api/user",{},{update:{method:"PUT",cache:!1,isArray:!1}})}}]),app.factory("SessionService",["$resource",function(a){return a(APIURL+"/api/session",{},{login:{method:"POST",cache:!1,isArray:!1},logout:{method:"DELETE",cache:!1,isArray:!1}})}]),app.factory("Data",["EntryService","UserService","localStorageService","Stats",function(a,b,c,d){function e(b){a.get({},function(a){g=d.matchEntriesToDates(a),c.set("days",g),b(g)},function(a){console.log("Error"+JSON.stringify(a))})}function f(a){var b=0;do g[b].entry&&g[b].entry.id==a.id&&(a.progress=Math.round(a.word_count/a.goal*100),g[b].entry=a),b++;while(b<g.length);c.set("days",g)}var g=c.get("days");return{loadEntries:function(a){g?a(g):e(a)},loadUser:function(){return c.get("user")},clear:function(){c.clearAll(),g=null},setUser:function(a){c.set("user",a)},getEntry:a.getEntry,saveEntry:function(b){f(b),a.update({id:b.id},{entry:b},function(a){a.forEach(function(a,b,c){f(a)})},function(a){console.log("Error"+JSON.stringify(a))})},updateUser:function(a){c.set("user",a),b.user.update({user:a},function(a){console.log("user updated"+JSON.stringify(a))},function(a){console.log("Error"+JSON.stringify(a))})}}}]),app.factory("Stats",function(){function a(a,b){var c=[],d=new Date(a);for(d.setHours(0,0,0,0),b=new Date(b),b.setHours(0,0,0,0);b>=d;)c.push({date:new Date(d),entry:null}),d.setDate(d.getDate()+1);return c}function b(a){var b=[0],c=0,d=0,e=0;return a.forEach(function(a,f,g){a.entry&&a.entry.word_count>=a.entry.goal?(b[e]++,c++):(e++,b[e]=0,(null==a.entry||0==a.entry.word_count)&&d++)}),{streak:Math.max.apply(null,b),data:[c,a.length-c-d,d]}}function c(a){var b=0,c={data:[[]],labels:[]};a.forEach(function(a,d,e){c.labels[d]=$.datepicker.formatDate("D M dd",new Date(a.date));var f=a.entry?a.entry.word_count:0;c.data[0][d]=f,b+=f});var d=Math.round(b/a.length);return c.dailyAvg=d,c.totalWords=b,c}return{matchEntriesToDates:function(b){var c=a(b[0].created_at,b[b.length-1].created_at);return c.forEach(function(a,c,d){b.forEach(function(b,c,d){var e=new Date(b.created_at);new Date(a.date);e.setHours(0,0,0,0)==a.date.setHours(0,0,0,0)&&(a.entry=b,a.entry.progress=Math.round(b.word_count/b.goal*100))})}),c},getStats:function(a){var d=a[a.length-1].entry,e={date:$.datepicker.formatDate("DD, MM dd",new Date),progress:Math.round(d.word_count/d.goal*100),data:[d.word_count,Math.max(d.goal-d.word_count,0)],labels:["Words Written Today","Words to Goal"]},f={totalDays:a.length,labels:["Days Completed","Days You Tried","Days Skipped"]};jQuery.extend(f,b(a));var g=c(a);return{today:e,completion:f,words:g}}}}),angular.module("wrnApp").run(["$templateCache",function(a){a.put("views/about.html","<p>This is the about view.</p>"),a.put("views/entry.html",'<div class="editor"> <ng-quill-editor ng-model="entry.currentEntry.content" ng-model-options="{ debounce: 1000 }" ng-change="entry.updateEntry()" read-only="true" theme="snow"> </ng-quill-editor> </div> <!-- Modal. Trigger on goal-reached --> <div class="modal fade" id="successModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog" role="document"> <div class="modal-content"> <div class="modal-body"> <h1><span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span> YAY! <span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span></h1> <h1><small>You\'ve reached today\'s goal!</small></h1> </div> </div> </div> </div> <footer class="navbar navbar-fixed-bottom"> <div class="container-fluid"> <div class="progress navbar-text" style="width: 5em"> <div class="progress-bar ng-class: entry.currentEntry.progress >= 100 ? \'progress-bar-success\' : \'progress-bar-info\'" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: {{ entry.currentEntry.progress > 100 ? 100 : entry.currentEntry.progress }}%"><span>{{ entry.currentEntry.progress }}%</span> </div> </div> <ul class="nav navbar-nav navbar-right"> <li><a href="" ng-click="entry.toggleFullscreen()"> <span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span> </a></li> </ul> </div><!-- container-fluid --> </footer>'),a.put("views/login.html",'<div class="container col-md-4 col-md-offset-4"> <form nonvalidate ng-submit="user.login()"> <p> <label>Email</label> <input type="email" ng-model="user.info.email" class="form-control"> </p> <p> <label>Password</label> <input type="password" ng-model="user.info.password" class="form-control"> </p> <p> <input type="submit" value="Login" class="btn btn-primary"> </p> </form> </div>'),a.put("views/main.html",'<div class="container"> <!-- Update User Goal --> <div ng-controller="UserCtrl as user"> <div class="page-header"><h1>{{ $root.currentUser.name }}\'s Entries</h1> <h3>Daily goal: {{ $root.currentUser.goal }} words <a href=""><span class="glyphicon glyphicon-edit" aria-hidden="true" aria-pressed="false" autocomplete="off" aria-label="Edit" data-toggle="collapse" data-target="#goalInput" aria-expanded="false" aria-controls="goalInput"></span></a> </h3> <div class="collapse" id="goalInput"> <div class="well well-sm"> <form name="goal" class="form-inline" ng-model-options="{ updateOn: \'blur\' }"> <label for="goal">Edit Daily Goal</label> <input name="goal" class="form-control" ng-model="$root.currentUser.goal" ng-change="user.updateGoal()"> </form> </div> </div> </div> <!-- Entry List --> <div class="main list-group" ng-repeat="day in main.days | orderBy:\'date\':true"> <div ng-show="day.entry"> <a class="list-group-item" ng-hide="day.entry.locked" ng-href="#/entries/{{ day.entry.id }}"> <h3>{{ day.date | date:"MMM d, y" }}</h3> <h3>{{day.entry.progress}}%</h3> <div class="progress"> <div class="progress-bar ng-class: day.entry.word_count/day.entry.goal >= 1 ? \'progress-bar-success\' : \'progress-bar-info\'" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: {{ day.entry.progress > 100 ? 100 : day.entry.progress }}%"> </div> </div><!-- progress --> <p><span>{{ day.entry.word_count }} / {{ day.entry.goal }}</span> words</p> <div class="preview">{{day.entry.preview}}</div> </a> <div class="list-group-item" ng-show="day.entry.locked"> <h3><span class="glyphicon glyphicon-lock" aria-hidden="true"></span> {{ day.date | date:"MMM d, y" }}</h3> <h3>{{day.entry.progress}}%</h3> <div class="progress"> <div class="progress-bar ng-class: day.entry.word_count/day.entry.goal >= 1 ? \'progress-bar-success\' : \'progress-bar-info\'" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: {{ day.entry.progress > 100 ? 100 : day.entry.word_count/day.entry.goal*100 }}%"></div> </div><!-- progress --> <p><span>{{ day.entry.word_count }} / {{ day.entry.goal }}</span> words</p> <div class="preview">{{day.entry.preview}}</div> </div> </div><!-- ng-show --> <div ng-hide="day.entry"> <div class="list-group-item"> <h3>{{ day.date | date:"MMM d, y" }}</h3> <h3>0%</h3> <div class="progress"> <div class="progress-bar" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 0%"> </div> </div><!-- progress --> <p>You skipped :(</p> </div> </div><!-- ng-hide --> </div> </div></div>'),a.put("views/register.html",'<div class="container col-md-4 col-md-offset-4"> <form nonvalidate ng-submit="user.register()"> <p> <label>Email</label> <input type="email" ng-model="user.info.email" class="form-control"> </p> <p> <label>Password</label> <input type="password" ng-model="user.info.password" class="form-control"> </p> <p> <label>Confirm Password</label> <input type="password" ng-model="user.info.password_confirmation" class="form-control"> </p> <p> <label>User Name</label> <input type="text" ng-model="user.info.name" class="form-control"> </p> <p> <label>Daily Writing Goal (words)</label> <input type="text" ng-model="user.info.goal" class="form-control"> </p> <p> <input type="submit" value="Register" class="btn btn-primary"> </p> </form> </div>'),a.put("views/stats.html",'<div class="container"> <div class="row"> <div class="page-header"> <h1>Today <small>{{stats.dt.today.date}}</small></h1> </div> <div class="col-md-4 col-xs-4"> <ul class="list-group"> <li class="list-group-item"><h3><small>Progress</small></h3><h3>{{stats.dt.today.progress}}%</h3></li> <li class="list-group-item"><h3><small>Words Written</small></h3><h3>{{stats.dt.today.data[0]}}</h3></li> <li class="list-group-item"><h3><small>Words to Goal</small></h3><h3>{{stats.dt.today.data[1]}}</h3></li> </ul> </div> <div class="col-md-6 col-xs-6"> <canvas id="doughnut" legend="true" class="chart chart-doughnut" data="stats.dt.today.data" labels="stats.dt.today.labels"> </canvas> </div> </div> <div class="row"> <div class="page-header"> <h1>Overview <small>of the last {{stats.dt.completion.totalDays}} days</small></h1> </div> <div class="col-md-4 col-xs-4"> <ul class="list-group"> <li class="list-group-item"><h3><small>Longest Streak</small></h3><h3>{{stats.dt.completion.streak}} Days</h3></li> <li class="list-group-item"><h3><small>Total Written</small></h3><h3>{{stats.dt.words.totalWords}} Words</h3></li> <li class="list-group-item"><h3><small>Daily Average</small></h3><h3>{{stats.dt.words.dailyAvg}} Words</h3></li> </ul> </div> <div class="col-md-6 col-xs-6"> <canvas id="pie" legend="true" class="chart chart-pie" data="stats.dt.completion.data" labels="stats.dt.completion.labels"> </canvas> </div> </div> <div class="row"> <div class="page-header"> <h1>Word Count <small>over time</small></h1> </div> <div class="col-md-12"> <canvas id="line" class="chart chart-line" data="stats.dt.words.data" labels="stats.dt.words.labels"> </canvas> </div> </div> </div>')}]);