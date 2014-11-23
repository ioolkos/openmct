/*global define,Promise*/

/**
 * Module defining ContextMenuGesture. Created by vwoeltje on 11/17/14.
 */
define(
    ["./GestureConstants"],
    function (GestureConstants) {
        "use strict";

        var MENU_TEMPLATE = "<mct-representation key=\"'context-menu'\" " +
                "mct-object=\"domainObject\" " +
                "ng-class=\"menuClass\"" +
                "ng-style=\"menuStyle\">" +
                "</mct-representation>",
            dismissExistingMenu;

        /**
         * Add listeners to a representation such that it launches a
         * custom context menu for the domain object it contains.
         *
         * @constructor
         * @param $compile Angular's $compile service
         * @param $document the current document
         * @param $window the active window
         * @param $rootScope Angular's root scope
         * @param element the jqLite-wrapped element which should exhibit
         *                the context mennu
         * @param {DomainObject} domainObject the object on which actions
         *                       in the context menu will be performed
         */
        function ContextMenuGesture($compile, $document, $window, $rootScope, element, domainObject) {
            function showMenu(event) {
                var winDim = [$window.innerWidth, $window.innerHeight],
                    eventCoors = [event.pageX, event.pageY],
                    menuDim = GestureConstants.MCT_MENU_DIMENSIONS,
                    body = $document.find('body'),
                    scope = $rootScope.$new(),
                    goLeft = eventCoors[0] + menuDim[0] > winDim[0],
                    goUp = eventCoors[1] + menuDim[1] > winDim[1],
                    menu;

                // Remove the context menu
                function dismiss() {
                    menu.remove();
                    body.off("click", dismiss);
                    dismissExistingMenu = undefined;
                }

                // Dismiss any menu which was already showing
                if (dismissExistingMenu) {
                    dismissExistingMenu();
                }

                // ...and record the presence of this menu.
                dismissExistingMenu = dismiss;

                // Set up the scope, including menu positioning
                scope.domainObject = domainObject;
                scope.menuStyle = {};
                scope.menuStyle[goLeft ? "right" : "left"] =
                    eventCoors[0] + 'px';
                scope.menuStyle[goUp ? "bottom" : "top"] =
                    eventCoors[1] + 'px';
                scope.menuClass = { "go-left": goLeft, "go-up": goUp, "context-menu-holder": true };

                // Create the context menu
                menu = $compile(MENU_TEMPLATE)(scope);

                // Add the menu to the body
                body.append(menu);

                // Dismiss the menu when body is clicked elsewhere
                body.on('click', dismiss);

                // Don't launch browser's context menu
                event.preventDefault();
            }

            // When context menu event occurs, show object actions instead
            element.on('contextmenu', showMenu);

            return {
                /**
                 * Detach any event handlers associated with this gesture,
                 * and dismiss any visible menu.
                 * @method
                 * @memberof ContextMenuGesture
                 */
                destroy: function () {
                    // Scope has been destroyed, so remove all listeners.
                    if (dismissExistingMenu) {
                        dismissExistingMenu();
                    }
                    element.off('contextmenu', showMenu);
                }
            };
        }

        return ContextMenuGesture;
    }
);