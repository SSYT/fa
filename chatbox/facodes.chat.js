(function(){
    if (!Array.prototype.indexOfPropertyValue){
      Array.prototype.indexOfPropertyValue = function(prop,value){
        for (var index = 0; index < this.length; index++){
          if (this[index][prop]){
            if (this[index][prop] == value){
              return index;
            }
          }
        }
        return -1;
      }
    }
})();

function fa_chatbox(method, data, callback) {
    this.method = method;
    this.data = data || {};
    this.callback = callback;
    this.readListen = {};
    this.params = {};
    this.users = [];

    switch(method) {
        case "read":
            $.ajax({
                url: '/post?p=19&mode=editpost',
                cache: false,
                data: data,
                type: "get",
                dataType: "text",
                success: callback
            });
            break;

        case "addMsg":
            $.ajax({
                url: '/post?p=19&mode=editpost',
                cache: false,
                data: data,
                type: "post",
                success: callback
            });
            break;
    }
    
    var default_params = {
        title: 'FACodes',
        avatars: false,
        refresh: 5000,
        cache: 30 * 60 * 1000,
        reload: true,
        autologin: true
    };

    $.extend(true, this.params, default_params);
};

fa_chatbox.prototype.init = function() {
    var self = this;

    fa_chatbox("read", {}, function(response) {
        if(/{"users":.+}]}/im.test(response)) {
            self.readListen = JSON.parse(/{"users":.+}]}/im.exec(response)[0]);
            console.log(self.readListen);
        }

        console.log('[SUCCESS] InitListening');
        self.readData();
    });
};

fa_chatbox.prototype.refresh = function() {

};

fa_chatbox.prototype.auto_login = function() {
    var self = this, usersChat = {};
    if(self.readListen.user == null) {
        fa_chatbox("read", {}, function(response) {
            usersChat = JSON.parse(/{"users":.+}]}/im.exec(response)[0]).users;

            var checkUsers = [], checkStatus = [];
            for (var i = usersChat.length - 1; i >= 0; i--) {
                checkUsers[usersChat[i].id] = usersChat[i].username;
                checkStatus[usersChat[i].id] = usersChat[i].staus;
            }
            
            if(checkUsers.indexOf(_userdata.username) !== -1) {
                var index = checkUsers.indexOf(_userdata.username);
                if(checkStatus[index] == 1) {
                    $('div#fa_chatbox_header > right').html('Disconnect').attr({
                        'onclick' : 'faChat.disconect(\''+ _userdata.username +'\')',
                        'data-cookie' : 'true'
                    });
                    $('#fa_chatbox').append('<div id="buttons"><input name="message" id="msg_zone" type="text" /> <input onclick="faChat.send(); return false;" value="Trimite" type="submit" /></div>');
                    // alert('Welcome back ' + _userdata.username);
                    console.log('User Status: ' + checkStatus[index]);
                } else {
                    console.log('not logged');
                    console.log('User Status: ' + checkStatus[index]);
                }
            } else {
                console.log('users is not in list');
            }
        });

        /*fa_chatbox("read", {}, function(response) {
            if(/{"users":.+}]}/im.test(response)) {
                self.readListen = JSON.parse(/{"users":.+}]}/im.exec(response)[0]);
            }

            var getUsers = [];
            $.each(self.readListen.users, function(i, value) {
                if(value.username == _userdata.username) {
                    if(value.staus == 0) {
                        value.staus = 1;
    
                        fa_chatbox("addMsg", {
                            subject: "database_chatbox",
                            message: JSON.stringify(self.readListen),
                            edit_reason: "",
                            attach_sig: 0,
                            notify: 0,
                            post: 1
                        }, function() {
                            $('div#fa_chatbox_header > right').html('Disconnect').attr({
                                'onclick' : 'faChat.disconect(\''+ _userdata.username +'\')',
                                'data-cookie' : 'true'
                            });
                            alert('Welcome back ' + _userdata.username);
                        });
                    } else {

                    }
                    !1;
                }

                if(value.username !== _userdata.username) {
                    self.readListen.users.push({
                        "id": _userdata.user_id,
                        "user_color": "#00000",
                        "admin": 0,
                        "username": _userdata.username,
                        "staus": 1
                    });

                    fa_chatbox("addMsg", {
                        subject: "database_chatbox",
                        message: JSON.stringify(self.readListen),
                        edit_reason: "",
                        attach_sig: 0,
                        notify: 0,
                        post: 1
                    }, function() {
                        $('div#fa_chatbox_header > right').html('Disconnect').attr({
                            'onclick' : 'faChat.disconect(\''+ _userdata.username +'\')',
                            'data-cookie' : 'true'
                        });
                        alert('Welcome to chatbox ' + _userdata.username);
                    });
                    !1;
                }
            });
        });*/
    }
};

fa_chatbox.prototype.format = function(callback) {

};

fa_chatbox.prototype.checkUsers = function() {
    var self = this, onlineUsers = [];
    if(self.readListen.users == null) {
        fa_chatbox("read", {}, function(response) {
            if(/{"users":.+}]}/im.test(response)) {
                self.readListen = JSON.parse(/{"users":.+}]}/im.exec(response)[0]);
            }

            if(self.readListen.users == null || self.readListen == null) return;
            $.ajax({
                url: '/viewonline',
                cache: false,
                type: "get",
                dataType: "text",
                success: function(response) {
                    $.each($('.forumbg table.table1 tbody tr:has("a[href*=\'/u\']")', response), function(y, index) {
                        onlineUsers[y] = $('td:has("a[href*=\'/u\']")', index).text();
                    });

                    $.each(self.readListen.users, function(i, value) {
                        if(onlineUsers.indexOf(value.username) === -1) {
                            if(value.staus == 1) self.updateUser(self.readListen, value.username, i);
                        }
                    });
                }
            });
        });
    }
};

fa_chatbox.prototype.updateUser = function(data, user, index) {
    data.users[index].staus = 0;
    fa_chatbox("addMsg", {
        subject: "database_chatbox",
        message: JSON.stringify(data),
        edit_reason: "",
        attach_sig: 0,
        notify: 0,
        post: 1
    }, function() {
        console.log(user + ' has been disconected');
    });
};

fa_chatbox.prototype.getStaffUser = function(id) {
    var self = this;
    if(data !== null) {
        for(var i = 0, j = self.readListen.users; i < j.length; i++) {
            if(new RegExp(id, 'g').test(j[i].username)) {
                var admin = (j[i].admin) ? 1 : 0;
                return admin;
            }
        }
    }
};

fa_chatbox.prototype.getUser = function(data, id) {
    if(data !== null) {
        for(var i in data) {
            if(data[i].username == id) {
                return 1;
            } else {
                return false;
            }
        }
    }
};

fa_chatbox.prototype.readData = function() {
    var self = this, content = null;
    fa_chatbox("read", {}, function(response) {
        if(!/{"users":.+}]}/im.test(response)) return;
        content = /{"users":.+}]}/im.exec(response);
        if(content !== null) {
            
            if(self.users) {
                self.users = [];
		        $(".online-users, .away-users").empty();
                $.each(JSON.parse(content).users, function(i, value) {
                    self.users[value.id] = value;

					var username = 	"<span style='color:"+ value.user_color +"'>"+
						(value.admin ? "@ " : "") +
						"<span class='chatbox-username chatbox-user-username' data-user='"+ value.id +"'>"+ value.username +"</span>"+
					"</span>";

					var list = (value.staus) ? '.online-users' : '.away-users';
					$(list).append('<li>' + username + '</li>');
                });
            }

            self.getMessages(content);
        }
    });
};

fa_chatbox.prototype.getMessages = function(content) {
    var self = this;

    if(this.content !== null) {
        var html = null;
        $.each(JSON.parse(content).messages, function(i, value) {
            html += "<p class='chatbox_row_" + (i % 2 == 1 ? 2 : 1) +" clearfix'>";
                html += "<span class='date-and-time' title='" + value.dateTime + "'>[" + value.date + "]</span>";
                html += "<span class='user' style='color:"+ value.user_color +"'>" +
                            "<strong>"+ 
                                (value.admin ? "@ " : "") +
                                "<span class='chatbox-username chatbox-message-username'  data-user='"+ value.id +"' >"+ value.username + "</span>&nbsp;:&nbsp;"+
                            "</strong>"+
                        "</span>"+
                        "<span class='msg'>"+
                            value.content
                        +"</span>"+
                    "</span>";
                html += "</p>";
        });
        document.getElementById('shouts').innerHTML = html.replace(/null/i, "");
        $("#shouts")[0].scrollTop = $("#shouts").prop('scrollHeight') * 2;
    }
};

fa_chatbox.prototype.reset = function() {
    var self = this, date = new Date();
    if(self.readListen.messages !== null) {
        self.readListen.messages = [];

        self.readListen.messages.push({
            id: 0,
            user_color: '#E60C42',
            admin: 1,
            username: 'ChatBot',
            date: date.getDay()+'/'+ date.getMonth() +'/'+date.getFullYear(),
            dateTime: date.getHours()+':'+ date.getMinutes() +':'+date.getSeconds(),
            content: "Meseje sterse din baza de date."
        });
        
        fa_chatbox("addMsg", {
            subject: "database_chatbox",
            message: JSON.stringify(self.readListen),
            edit_reason: "",
            attach_sig: 0,
            notify: 0,
            post: 1
        }, function() {
            self.readData();
        });
    }
};

fa_chatbox.prototype.send = function() {
    var self = this, date = new Date();
    if(document.getElementById('msg_zone').value == "") return;

    self.readListen.messages.push({
        id: _userdata.user_id,
        user_color: (self.getStaffUser(_userdata.username) == 1) ? '#E60C42' : '#000',
        admin: (self.getStaffUser(_userdata.username) == 1) ? 1 : 0,
        username: _userdata.username,
        date: date.getDay()+'/'+ date.getMonth() +'/'+date.getFullYear(),
        dateTime: date.getHours()+':'+ date.getMinutes() +':'+date.getSeconds(),
        content: document.getElementById('msg_zone').value
    });
    
    document.getElementById('msg_zone').value = "";

    fa_chatbox("addMsg", {
        subject: "database_chatbox",
        message: JSON.stringify(self.readListen),
        edit_reason: "",
        attach_sig: 0,
        notify: 0,
        post: 1
    }, function() {
        self.readData();
    });
};

if(typeof faChat == "undefined") {
    var faChat = new fa_chatbox();
    $(function() {
        faChat.init();
        faChat.checkUsers();
        //faChat.auto_login(_userdata.username);

        setInterval(function() {
            faChat.checkUsers();
        }, 5 * 60 * 1000);
    });
}
