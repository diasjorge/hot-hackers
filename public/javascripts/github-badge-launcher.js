/*  GitHub Badge, version 1.2.4
 *  (c) 2008 Dr Nic Williams
 *
 *  GitHub Badge is freely distributable under
 *  the terms of an MIT-style license.
 *  For details, see the web site: http://github.com/drnic/github-badges/tree/master
 *
 *--------------------------------------------------------------------------*/

var GithubBadge = {
  Version: '1.2.4'
};

var GitHubBadge = GitHubBadge || {};

GitHubBadge.Launcher = new function() {
  function requestStylesheet( url, style_id ) {
    if ("jQuery" in window) {
      jQuery('head').prepend(
        jQuery('<link rel="stylesheet" type="text/css"></link>')
        .attr('href', url)
        .attr('id', style_id)
      )
    } else {
      document.write('<link rel="stylesheet" href="'+url+'" type="text/css"' + id_attr + '></link>');
    }
  }

  function basePath() {
    var scripts = document.getElementsByTagName("script");
    for (var i=0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.match(/github-badge-launcher\.js(\?.*)?/)) {
        return scripts[i].src.replace(/github-badge-launcher\.js(\?.*)?/, '');
      }
    }
  }

  this.init = function() {
    var libraries = [
        [typeof jQuery, "ext/jquery"],
        [typeof jQuery != "undefined" && typeof jQuery.template, "ext/jquery.template"],
        [typeof GitHubBadge.loadUserInfo, "github-badge"]
      ];
    var scripts = document.getElementsByTagName("script");
    for (var i=0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.match(/github-badge-launcher\.js(\?.*)?/)) {
        this.path = scripts[i].src.replace(/github-badge-launcher\.js(\?.*)?/, '');
        for (var i=0; i < libraries.length; i++) {
          var libraryInstalled = libraries[i][0];
          var relativeLibraryPath = libraries[i][1];
          if (libraryInstalled == "undefined" || !libraryInstalled) {
            var url = this.path + relativeLibraryPath + ".js";
            if (i == libraries.length - 1) {
              this.requestContent(url, "GitHubBadge.Launcher.loadedLibraries");
            } else {
              this.requestContent(url);
            }
          }
        }
        break;
      }
    }
  }

  this.loadedLibraries = function() {
    if(typeof jQuery == 'undefined' || typeof jQuery.template == 'undefined')
      throw("GitHub Badge requires jQuery and jQuery.template");

    jQuery('.github-badge').each(function() {
      GitHubBadge.buildUserBadge(this);
    });
  }
};

GitHubBadge.Launcher.requestContent = function( url, callback ) {
  // inserting via DOM fails in Safari 2.0, so brute force approach
  if ("jQuery" in window && url.match(/^http/)) {
    if (typeof callback != "undefined") {
      // console.debug("jQuery.getScript('" + url + "', '" + callback + "');");
      jQuery.getScript(url,function() { eval(callback + "()") });
    } else {
      // console.debug("jQuery.getScript('" + url + "');");
      jQuery.getScript(url);
    }
  } else {
    onLoadStr = (typeof callback == "undefined") ? "" : 'onload="' + callback + '()" ';
    // console.debug('<script ' + onLoadStr + 'type="text/javascript" src="'+url+'"></script>');
    document.write('<script ' + onLoadStr + 'type="text/javascript" src="'+url+'"></script>');
  }
}

GitHubBadge.Launcher.init();