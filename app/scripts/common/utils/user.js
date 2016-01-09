'use strict';

var $ = require('jquery');
var Promise = require('bluebird'); // jshint ignore:line

var config = require('../config');
var localforage = require('localforage');

var nusmodsCloud = require('../../nusmods-cloud');
var userNamespace = config.namespaces.user + ':';

var IVLE_LAPI_KEY = config.IVLE.LAPIKey;

module.exports = {
  ivleDialog: null,
  userProfile: null,
  getLoginStatus: function (callback) {
    var that = this;

    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;

      if (that.userProfile) {
        fn({
          loggedIn: true,
          userProfile: that.userProfile
        });
        return;
      }

      localforage.getItem(userNamespace + 'profile', function (userProfile) {
        if (userProfile && userProfile.nusnetId) {
          that.userProfile = userProfile;
          fn({
            loggedIn: true,
            userProfile: userProfile
          });
        } else {
          fn({
            loggedIn: false
          });
        }
      });
    });
  },
  login: function (callback) {
    var that = this;

    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      if (that.ivleDialog === null || that.ivleDialog.closed) {
        var w = 255;
        var h = 210;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 3) - (h / 2);
        var options = 'dependent, toolbar=no, location=no, directories=no, ' +
                      'status=no, menubar=no, scrollbars=no, resizable=no, ' +
                      'copyhistory=no, width=' + w + ', height=' + h +
                      ', top=' + top + ', left=' + left;

        window.ivleLoginSuccessful = function (ivleToken) {
          localforage.setItem(userNamespace + 'ivleToken', ivleToken);

          nusmodsCloud.auth(ivleToken, function (userProfile) {
            localforage.setItem(userNamespace + 'profile', userProfile);
            localforage.setItem(userNamespace + 'accessToken', userProfile.accessToken);
            that.userProfile = userProfile;
            fn({
              loggedIn: true,
              userProfile: userProfile
            });
            window.ivleLoginSuccessful = undefined;
          });
        };

        var callbackUrl = window.location.protocol + '//' + window.location.host + '/ivlelogin.html';
        var popUpUrl = 'https://ivle.nus.edu.sg/api/login/?apikey=' + IVLE_LAPI_KEY + '&url=' + callbackUrl;
        that.ivleDialog = window.open(popUpUrl, '', options);
      } else {
        that.ivleDialog.focus();
      }
    });
  },
  logout: function () {
    localforage.removeItem(userNamespace + 'profile');
    localforage.removeItem(userNamespace + 'accessToken');
    this.userProfile = null;
  },
  getUser: function (callback) {
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      if (that.userProfile) {
        fn(userProfile);
        return;
      }
      localforage.getItem(userNamespace + 'profile', function (userProfile) {
        fn(userProfile);
      });
    });
  },
  getFriends: function (callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.getFriends(that.userProfile.nusnetId, fn);
    });
  },
  getFriendsTimetable: function (callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.getFriendsTimetable(that.userProfile.nusnetId, '2015-2016/sem1', fn);
    });
  },
  addFriend: function (friendNusnetId, callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.addFriend(that.userProfile.nusnetId, friendNusnetId, fn);
    });
  },
  unfriend: function (friendNusnetId, callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.unfriend(that.userProfile.nusnetId, friendNusnetId, fn);
    });
  },
  getPendingFriendRequestsReceived: function (callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.getPendingFriendRequestsReceived(that.userProfile.nusnetId, fn);
    });
  },
  getPendingFriendRequestsSent: function (callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.getPendingFriendRequestsSent(that.userProfile.nusnetId, fn);
    });
  },
  acceptFriendRequest: function (friendNusnetId, callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.acceptFriendRequest(that.userProfile.nusnetId, friendNusnetId, fn);
    });
  },
  rejectFriendRequest: function (friendNusnetId, callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.rejectFriendRequest(that.userProfile.nusnetId, friendNusnetId, fn);
    });
  },
  cancelFriendRequest: function (friendNusnetId, callback) {
    if (!this.userProfile) {
      alert('Login first!');
      return;
    }
    var that = this;
    return new Promise(function (resolve) {
      var fn = callback ? callback : resolve;
      nusmodsCloud.cancelFriendRequest(that.userProfile.nusnetId, friendNusnetId, fn);
    });
  }
}
