angular.module('MyApp').run(['$templateCache', function($templateCache) {$templateCache.put('partials/404.html','<div class="container text-center">\n  <h1>404</h1>\n  <p>Page Not Found</p>\n</div>');
$templateCache.put('partials/add-product.html','<div class="container">\n    <div>\n        <!--Header area-->\n        <div style="display:flex;justify-content: center; ">\n            <div ng-show="index > 0" class="prev" ng-click="prev()"\n                 style="border: 1px solid black;padding: 10px;align-self: center;cursor: pointer">\n                <\n            </div>\n            <h2 style="margin-left: 20px; margin-right: 20px">Add New Product</h2>\n            <div class="next"  ng-click="next()"\n                 style="border: 1px solid black;padding: 10px;align-self: center;cursor: pointer">\n                >\n            </div>\n\n        </div>\n\n        <div style="display:flex;justify-content: center; ">\n            <md-radio-group ng-model="productStatus" style="display: flex;justify-content: space-around;">\n                <md-radio-button style="margin-right: 5px; margin-left:5px" value="FOR_REVIEW"> New </md-radio-button>\n                <md-radio-button style="margin-right: 5px; margin-left:5px" value="MARK" class="md-primary">Marked</md-radio-button>\n            </md-radio-group>\n        </div>\n        <div style="display: flex;justify-content: center;">\n            <div class="edit-product" ng-show="products[index].id" style="display: flex;margin-right: 10px">\n                <div style="display: flex;flex-direction: column; margin-right: 30px">\n                    <img ng-src="{{products[index].product_image_url}}" style="max-height: 250px;max-width: 250px;margin-bottom:30px">\n                    <md-input-container>\n                        <label>Image Url</label>\n                        <input ng-model="products[index].product.image_url" style="color:black;">\n                    </md-input-container>\n                </div>\n                <div style="display: flex;flex-direction: column;">\n                    <md-input-container>\n                        <label>Name</label>\n                        <input ng-model="products[index].product.name" style="color:black;">\n                    </md-input-container>\n                    <md-input-container>\n                        <label>Barcode</label>\n                        <input ng-model="products[index].product.barcode_id" style="color:black;">\n                    </md-input-container>\n                    <md-input-container>\n                        <label>Amazon id</label>\n                        <input ng-model="products[index].product.amazon_id" style="color:black;">\n                    </md-input-container>\n                    <md-input-container>\n                        <label>Category</label>\n                        <input ng-model="products[index].product.category" style="color:black;">\n                    </md-input-container>\n                    <md-input-container>\n                        <label>Product URL</label>\n                        <input ng-model="products[index].product.product_url" style="color:black;">\n                    </md-input-container>\n                    <textarea\n                            ng-model="products[index].product.ingredients_raw"\n                            name="Ingredients"\n                            ng-trim="true">\n                    </textarea>\n\n                    <div style="font-weight: bold; margin-top:40px">\n                        <div ng-show="error != \'\' ">{{error}}</div>\n                    </div>\n                    <div style="display: flex; margin-top: 20px">\n                        <md-button ng-show="!isSaved" ng-click="save()" class="md-raised md-primary">Save</md-button>\n                        <md-button ng-show="isSaved"  ng-click="save()" class="md-raised md-primary">Saved</md-button>\n                        <md-button ng-click="undo()" class="md-raised md-warning">Undo</md-button>\n                        <md-button ng-show="products[index].status === \'FOR_REVIEW\'" ng-click="mark(\'MARK\')" class="md-raised md-warning">Mark</md-button>\n                        <md-button ng-show="products[index].status === \'MARK\'" ng-click="mark(\'FOR_REVIEW\')" class="md-raised md-warning">UnMark</md-button>\n                    </div>\n                </div>\n                <div style="display: flex;flex-direction: column;margin-left:30px">\n                    <a href="{{products[index].ingredients_image_url}}"target="_blank"><img ng-src="{{products[index].ingredients_image_url}}" style="max-height: 350px;max-width: 350px;"></a>\n                    <div>ingredients image</div>\n                </div>\n                <!--{{selected | json}}-->\n            </div>\n        </div>\n    </div>\n</div>\n');
$templateCache.put('partials/allergy-diagnose.html','<div id="diagnose">\n    <div class="diagnose-header">\n        <div class="logo">\n            IV\n        </div>\n        <div class="title">\n            Self Diagnose\n        </div>\n        <div class="spacer">\n        </div>\n    </div>\n\n\n    <div class="diagnose-body">\n        <div class="left-side-container">\n            <div class="select-products-container">\n                <md-content layout-padding layout="column">\n                    <form ng-submit="$event.preventDefault()">\n                        <md-autocomplete\n                                md-no-cache="true"\n                                md-input-name="autocompleteField"\n                                ng-disabled="false"\n                                md-selected-item="selected"\n                                md-search-text-change="searchTextChange(searchCriteria.searchText)"\n                                md-search-text="searchCriteria.searchText"\n                                md-selected-item-change="selectedItemChange(item)"\n                                md-items="item in search(searchCriteria.searchText)"\n                                md-item-text="getProductDetails(item)"\n                                md-min-length="0"\n                                placeholder="Pick an Angular repository"\n                                md-menu-class="autocomplete-custom-template">\n                            <md-item-template>\n                                  <span class="item-title" style="display: flex;align-items: center">\n                                    <img style="height: 30px; margin-right: 10px" src={{item.image_url}}>\n                                    <span> {{item.name}} </span>\n                                  </span>\n                                 <span class="item-metadata">\n                                    <!--<span>-->\n                                      <!--<strong>{{item.watchers}}</strong> watchers-->\n                                    <!--</span>-->\n                                    <!--<span>-->\n                                      <!--<strong>{{item.forks}}</strong> forks-->\n                                    <!--</span>-->\n                                  </span>\n                            </md-item-template>\n                        </md-autocomplete>\n                    </form>\n                </md-content>\n            </div>\n\n            <div class="selected-product-container" >\n                <div class="selected-product" style="display: flex; align-items: center; margin:30px">\n                    <img src={{selectedItem.image_url}} style="height: 50px">\n                    <div>{{selectedItem.name}}</div>\n                </div>\n\n                <!--<select name="singleSelect" ng-model="selectedItem.personal_effect">-->\n                    <!--<option value="RASH">Rash</option>-->\n                    <!--<option value="PIMPLES">Pimples</option>-->\n                <!--</select>-->\n\n                <div  style=" position: relative">\n                    <md-input-container flex="50" style=" position: relative">\n                        <label>Skin effect</label>\n                        <md-select name="favoriteColor" ng-model="selectedItem.favoriteColor">\n                            <md-option value="RASH">Rash</md-option>\n                            <md-option value="PIMPLES">Pimples</md-option>\n                        </md-select>\n                        <div class="errors">\n                            <div ng-message="required">Required</div>\n                        </div>\n                    </md-input-container>\n                </div>\n                <md-button class="md-raised" ng-click="select()" style="margin-top: 30px">Add</md-button>\n                <md-button class="md-raised" ng-click="clear()" style="margin-top: 30px">Clear</md-button>\n            </div>\n\n            <div class="selected-allergies-container">\n                <!--Selected products - mdlist-->\n                <h3>Selected items</h3>\n                <div class="selected-product" style="display: flex; align-items: center; margin:30px" ng-repeat="product in selectedProducts">\n                    <img src={{product.image_url}} style="height: 50px">\n                    <div style="display: flex;flex-direction: column">\n                        <div>{{product.name}}</div>\n                        <div>{{product.personal_effect}}</div>\n                    </div>\n                </div>\n            </div>\n\n            <!--<md-button class="md-raised" ng-click="analyze()" style="margin-top: 30px">Analyze</md-button>-->\n        </div>\n\n        <div class="right-side-container">\n            <div class="selected-allergies-container" ng-hide="allergiesDetected.length === 0">\n                <h3>Detected allergies</h3>\n                <div class="detected-allergy" style="display: flex; align-items: center; margin:30px" ng-repeat="allergyDetected in allergiesDetected">\n                    <div  style="display: flex;flex-direction: column">\n                        <div>Name: {{allergyDetected.chemicalName}} - {{allergyDetected.weight}}%</div>\n                        <div><b>Products:</b></div>\n                        <div class="allergy-related-products" ng-repeat="relatedProduct in allergyDetected.products">\n                            {{relatedProduct.name}}\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class="selected-allergies-container" ng-show="allergiesDetected.length === 0">\n                <h3>No allergies detected</h3>\n            </div>\n        </div>\n    </div>\n\n</div>');
$templateCache.put('partials/contact.html','<div class="container">\n  <h3>Contact Form</h3>\n  <div ng-if="messages.error" role="alert" class="text-danger">\n    <div ng-repeat="error in messages.error">{{error.msg}}</div>\n  </div>\n  <div ng-if="messages.success" role="alert" class="text-success">\n    <div ng-repeat="success in messages.success">{{success.msg}}</div>\n  </div>\n  <form ng-submit="sendContactForm()">\n    <label for="name">Name</label>\n    <input type="text" name="name" id="name" ng-model="contact.name" autofocus>\n    <label for="email">Email</label>\n    <input type="email" name="email" id="email" ng-model="contact.email">\n    <label for="message">Body</label>\n    <textarea name="message" id="message" rows="7" ng-model="contact.message"></textarea>\n    <br>\n    <button type="submit">Send</button>\n  </form>\n</div>\n');
$templateCache.put('partials/footer.html','<footer>\n  <!--<p>\xA9 2016 Company, Inc. All Rights Reserved.</p>-->\n</footer>');
$templateCache.put('partials/forgot.html','<div class="container">\n  <div ng-if="messages.error" role="alert" class="text-danger">\n    <div ng-repeat="error in messages.error">{{error.msg}}</div>\n  </div>\n  <div ng-if="messages.success" role="alert" class="text-success">\n    <div ng-repeat="success in messages.success">{{success.msg}}</div>\n  </div>\n  <form ng-submit="forgotPassword()">\n    <h4>Forgot Password</h4>\n    <p>Enter your email address below and we\'ll send you password reset instructions.</p>\n    <label for="email">Email</label>\n    <input type="email" name="email" id="email" placeholder="Email" ng-model="user.email" autofocus>\n    <br>\n    <button type="submit">Reset Password</button>\n  </form>\n</div>\n');
$templateCache.put('partials/header.html','<div ng-controller="HeaderCtrl" class="container">\n  <ul class="list-inline">\n    <li><a href="/">Home</a></li>\n    <li><a href="/contact">Contact</a></li>\n  </ul>\n  <ul ng-if="isAuthenticated()" class="list-inline">\n    <li><a href="/account" ng-class="{ active: isActive(\'/account\')}">My Account</a></li>\n    <li><a href="/product-editor" ng-class="{ active: isActive(\'/product-editor\')}">Product Editor</a></li>\n    <li><a href="/add-product-editor" ng-class="{ active: isActive(\'/add-product-editor\')}">Add New Product</a></li>\n    <li><a href="/diagnose" ng-class="{ active: isActive(\'/diagnose\')}">Diagnose</a></li>\n    <li><a href="#" ng-click="logout()">Logout</a></li>\n  </ul>\n\n  <ul ng-if="!isAuthenticated()" class="list-inline">\n    <li><a href="/login" ng-class="{ active: isActive(\'/login\')}">Log in</a></li>\n    <li><a href="/signup" ng-class="{ active: isActive(\'/signup\')}">Sign up</a></li>\n  </ul>\n</div>\n');
$templateCache.put('partials/home.html','<div class="container">\n  <div class="row">\n    <div class="col-sm">\n      <h3>Heading</h3>\n      <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris\n        condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod.\n        Donec sed odio dui.</p>\n      <a href="#" role="button">View details</a>\n    </div>\n    <div class="col-sm">\n      <h3>Heading</h3>\n      <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris\n        condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod.\n        Donec sed odio dui.</p>\n      <a href="#" role="button">View details</a>\n    </div>\n    <div class="col-sm">\n      <h3>Heading</h3>\n      <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris\n        condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod.\n        Donec sed odio dui.</p>\n      <a href="#" role="button">View details</a>\n    </div>\n  </div>\n</div>\n');
$templateCache.put('partials/login.html','<div class="container">\n  <div ng-if="messages.error" role="alert" class="text-danger">\n    <div ng-repeat="error in messages.error">{{error.msg}}</div>\n  </div>\n\n  <h4>Log In</h4>\n\n  <form ng-submit="login()">\n    <label for="email">Email</label>\n    <input type="email" name="email" id="email" placeholder="Email" ng-model="user.email" autofocus>\n    <label for="password">Password</label>\n    <input type="password" name="password" id="password" placeholder="Password" ng-model="user.password">\n    <p><a href="/forgot">Forgot your password?</a></p>\n    <button type="submit">Log in</button>\n  </form>\n\n  <hr>\n\n\n  <p>Don\'t have an account? <a href="/signup">Sign up</a></p>\n</div>\n');
$templateCache.put('partials/product-editor.html','<div ng-controller="ProductEditorCtrl" class="container">\n   <div>\n      <!--Header area-->\n      <div>\n         <h2>Product Editor - V1</h2>\n      </div>\n\n      <div style="display: flex">\n         <div style="display: flex;flex-direction: column; max-width: 30%;min-width: 30%">\n            <md-input-container class="md-block" flex-gt-sm>\n               <md-input-container>\n                  <label>Search</label>\n                  <input ng-model="searchCriteria.searchText" ng-keydown="$event.which === 13 && search()" style="color:black;">\n               </md-input-container>\n               <md-button ng-click="search()" class="md-raised md-primary">Search</md-button>\n            </md-input-container>\n            <md-radio-group ng-model="searchCriteria.db" style="display: flex;justify-content: space-around;">\n               <md-radio-button value="scrapeproducts" class="md-primary">Scraped</md-radio-button>\n               <md-radio-button value="products"> Products </md-radio-button>\n            </md-radio-group>\n\n            <div ng-show="isLoading" style="margin-top: 20px">Loading... Wait....</div>\n            <div ng-show="!isLoading" style="border-top: 1px solid gray;">\n               <md-list flex>\n                  <md-subheader class="md-no-sticky">Products</md-subheader>\n\n                  <md-list-item class="md-3-line" ng-repeat="item in products" ng-click="selectedItem(item)">\n                     <img ng-src="{{item.image_url}}?{{$index}}" class="md-avatar" alt="{{item.name}}" />\n                     <div class="md-list-item-text" layout="column">\n                        <h3>{{ item.name }}</h3>\n                        <h4> <a href="{{ item.product_url }}">Link to product<a/></h4>\n                        <p>{{ item.scraper_strategy }}</p>\n                     </div>\n                  </md-list-item>\n\n               </md-list>\n            </div>\n         </div>\n\n         <div class="edit-product" ng-show="selected.id" style="display: flex;margin-right: 10px">\n            <div style="display: flex;flex-direction: column">\n               <img ng-src="{{selected.image_url}}" style="max-height: 150px;max-width: 150px;margin-bottom:30px">\n               <md-input-container>\n                  <label>Image Url</label>\n                  <input ng-model="selected.image_url" style="color:black;">\n               </md-input-container>\n\n\n            </div>\n            <div style="display: flex;flex-direction: column;">\n               <md-input-container>\n                  <label>Name</label>\n                  <input ng-model="selected.name" style="color:black;">\n               </md-input-container>\n               <md-input-container>\n                  <label>Barcode</label>\n                  <input ng-model="selected.barcode_id" style="color:black;">\n               </md-input-container>\n               <md-input-container>\n                  <label>Amazon id</label>\n                  <input ng-model="selected.amazon_id" style="color:black;">\n               </md-input-container>\n               <md-input-container>\n                  <label>Category</label>\n                  <input ng-model="selected.category" style="color:black;">\n               </md-input-container>\n               <md-input-container>\n                  <label>Product URL</label>\n                  <input ng-model="selected.product_url" style="color:black;">\n               </md-input-container>\n               <textarea\n                       ng-model="selected.ingredients_raw"\n                       name="Ingredients"\n                       ng-trim="true">\n               </textarea>\n\n               <div style="font-weight: bold; margin-top:40px">\n                  <div ng-show="selected.num_of_searches">{{selected.num_of_searches}}</div>\n                  <div ng-show="selected.scraped_time">{{selected.scraped_time | date}}</div>\n                  <div ng-show="selected.scraper_strategy">{{selected.scraper_strategy}}</div>\n                  <div ng-show="selected.scraper_results">{{selected.scraper_results}}</div>\n               </div>\n               <div style="display: flex; margin-top: 20px">\n                  <md-button ng-show="!isSaved" ng-click="save()" class="md-raised md-primary">Save</md-button>\n                  <md-button ng-show="isSaved"  ng-click="save()" class="md-raised md-primary">Saved</md-button>\n                  <md-button ng-click="undo()" class="md-raised md-warning">Undo</md-button>\n               </div>\n            </div>\n            <!--{{selected | json}}-->\n         </div>\n      </div>\n   </div>\n</div>\n');
$templateCache.put('partials/profile.html','<div class="container">\n  <div ng-if="messages.error" role="alert" class="text-danger">\n    <div ng-repeat="error in messages.error">{{error.msg}}</div>\n  </div>\n  <div ng-if="messages.success" role="alert" class="text-success">\n    <div ng-repeat="success in messages.success">{{success.msg}}</div>\n  </div>\n\n  <h4>Profile Information</h4>\n\n  <form ng-submit="updateProfile()">\n    <label for="email">Email</label>\n    <input type="email" name="email" id="email" ng-model="profile.email">\n    <label for="name">Name</label>\n    <input type="text" name="name" id="name" ng-model="profile.name">\n    <label>Gender</label>\n    <input type="radio" name="gender" id="male" value="male" ng-checked="profile.gender === \'male\'">\n    <label for="male">Male</label>\n    <input type="radio" name="gender" id="female" value="female" ng-checked="profile.gender === \'female\'">\n    <label for="female">Female</label>\n    <label for="location">Location</label>\n    <input type="text" name="location" id="location" ng-model="profile.location">\n    <label for="website">Website</label>\n    <input type="text" name="website" id="website" ng-model="profile.website">\n    <label>Gravatar</label>\n    <img ng-src="{{profile.gravatar}}" class="gravatar" width="100" height="100">\n    <br>\n    <button type="submit">Update Profile</button>\n  </form>\n\n  <h4>Change Password</h4>\n\n  <form ng-submit="changePassword()">\n    <label for="password">New Password</label>\n    <input type="password" name="password" id="password" ng-model="profile.password">\n    <label for="confirm">Confirm Password</label>\n    <input type="password" name="confirm" id="confirm" ng-model="profile.confirm">\n    <br>\n    <button type="submit">Change Password</button>\n  </form>\n\n  <h4>Linked Accounts</h4>\n\n\n  <h4>Delete Account</h4>\n\n  <form ng-submit="deleteAccount()">\n    <p>You can delete your account, but keep in mind this action is irreversible.</p>\n    <button type="submit">Delete my account</button>\n  </form>\n</div>\n');
$templateCache.put('partials/reset.html','<div class="container">\n  <div ng-if="messages.error" role="alert" class="text-danger">\n    <div ng-repeat="error in messages.error">{{error.msg}}</div>\n  </div>\n  <div ng-if="messages.success" role="alert" class="text-success">\n    <div ng-repeat="success in messages.success">{{success.msg}}</div>\n  </div>\n\n  <h4>Reset Password</h4>\n\n  <form ng-submit="resetPassword()">\n    <label for="password">New Password</label>\n    <input type="password" name="password" id="password" placeholder="New password" ng-model="user.password" autofocus>\n    <label for="confirm">Confirm Password</label>\n    <input type="password" name="confirm" id="confirm" placeholder="Confirm password" ng-model="user.confirm">\n    <br>\n    <button type="submit">Change Password</button>\n  </form>\n</div>\n');
$templateCache.put('partials/signup.html','<div class="container">\n  <div ng-if="messages.error" role="alert" class="text-danger">\n    <div ng-repeat="error in messages.error">{{error.msg}}</div>\n  </div>\n\n  <h4>Create an account</h4>\n\n  <form ng-submit="signup()">\n    <label for="email">Email</label>\n    <input type="email" name="email" id="email" placeholder="Email" ng-model="user.email" autofocus>\n    <label for="name">Name</label>\n    <input type="text" name="name" id="name" placeholder="Name" ng-model="user.name">\n    <label for="password">Password</label>\n    <input type="password" name="password" id="password" placeholder="Password" ng-model="user.password">\n    <p>By signing up, you agree to the <a href="/">Terms of Service</a>.</p>\n    <button type="submit">Create an account</button>\n  </form>\n\n  <hr>\n\n\n  <p>Already have an account? <a href="/login">Log in</a></p>\n</div>\n');}]);