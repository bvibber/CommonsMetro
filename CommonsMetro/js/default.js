// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    WinJS.Namespace.define("HubContents", {
        itemList: new WinJS.Binding.List([])
    });
    (function () {
        // Create the groups for the ListView from the item data and the grouping functions
        HubContents.groupedList = HubContents.itemList.createGrouped(getGroupKey, getGroupData, compareGroups);

        // Function used to sort the groups
        // Note: This is similar to default sorting behavior 
        //   when using WinJS.Binding.List.createGrouped()
        function compareGroups(left, right) {
            return (left < right) ? -1 : 1;
        }

        // Function which returns the group key that an item belongs to
        function getGroupKey(dataItem) {
            return dataItem.group;
        }

        // Function which returns the data for a group
        function getGroupData(dataItem) {
            return {
                title: dataItem.groupText
            };
        }
    })();

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            var all = WinJS.UI.processAll();
            all.done(function () {
                setupHub();
            });
            args.setPromise(all);
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();

    function setupHub() {
        var list = HubContents.itemList;
        for (var group in cats) {
            console.log(group);
            cats[group].forEach(function (cat) {
                var item = {
                    title: cat,
                    group: group,
                    groupText: group,
                    image: '#',
                    style: 'photo-item'
                };
                loadCategoryImage(cat).done(function (imageinfo) {
                    if (imageinfo) {
                        //$('#' + imageid).attr('src', imageinfo.thumburl);
                        item.image = imageinfo.thumburl;
                        list.push(item);
                    }
                });
            });
        }
    }

    function loadCategoryImage(category) {
        return new WinJS.Promise(function (complete, err, progress) {
            Commons.request({
                action: 'query',
                list: 'categorymembers',
                cmtitle: 'Category:' + category,
                cmtype: 'file',
                cmlimit: 10
            }).done(function (data) {
                var members = data.query.categorymembers;
                if (members.length == 0) {
                    // fail
                    complete('empty');
                } else {
                    var img = members[0].title.replace(/^File:/, '');
                    var fetcher = new ImageFetcher(150, 150);
                    fetcher.request(img).done(complete);
                    fetcher.send();
                }
            });
        });
    }
})();
