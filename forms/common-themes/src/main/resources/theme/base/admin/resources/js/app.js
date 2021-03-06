'use strict';

var consoleBaseUrl = window.location.href;
consoleBaseUrl = consoleBaseUrl.substring(0, consoleBaseUrl.indexOf("/console"));
consoleBaseUrl = consoleBaseUrl + "/console";
var configUrl = consoleBaseUrl + "/config";

var auth = {};

var module = angular.module('keycloak', [ 'keycloak.services', 'keycloak.loaders', 'ui.bootstrap', 'ui.select2', 'angularFileUpload' ]);
var resourceRequests = 0;
var loadingTimer = -1;

angular.element(document).ready(function () {
    var keycloakAuth = new Keycloak(configUrl);

    keycloakAuth.onAuthLogout = function() {
        location.reload();
    }

    keycloakAuth.init({ onLoad: 'login-required' }).success(function () {
        auth.authz = keycloakAuth;
        module.factory('Auth', function() {
            return auth;
        });
        angular.bootstrap(document, ["keycloak"]);
    }).error(function () {
        window.location.reload();
    });
});

module.factory('authInterceptor', function($q, Auth) {
    return {
        request: function (config) {
            if (!config.url.match(/.html$/)) {
                var deferred = $q.defer();
                if (Auth.authz.token) {
                    Auth.authz.updateToken(5).success(function () {
                        config.headers = config.headers || {};
                        config.headers.Authorization = 'Bearer ' + Auth.authz.token;

                        deferred.resolve(config);
                    }).error(function () {
                        location.reload();
                    });
                }
                return deferred.promise;
            } else {
                return config;
            }
        }
    };
});




module.config([ '$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/create/realm', {
            templateUrl : resourceUrl + '/partials/realm-create.html',
            resolve : {

            },
            controller : 'RealmCreateCtrl'
        })
        .when('/realms/:realm', {
            templateUrl : resourceUrl + '/partials/realm-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'RealmDetailCtrl'
        })
        .when('/realms/:realm/login-settings', {
            templateUrl : resourceUrl + '/partials/realm-login-settings.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'RealmLoginSettingsCtrl'
        })
        .when('/realms/:realm/theme-settings', {
            templateUrl : resourceUrl + '/partials/realm-theme-settings.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'RealmThemeCtrl'
        })
        .when('/realms/:realm/cache-settings', {
            templateUrl : resourceUrl + '/partials/realm-cache-settings.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'RealmCacheCtrl'
        })
        .when('/realms', {
            templateUrl : resourceUrl + '/partials/realm-list.html',
            controller : 'RealmListCtrl'
        })
        .when('/realms/:realm/token-settings', {
            templateUrl : resourceUrl + '/partials/realm-tokens.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'RealmTokenDetailCtrl'
        })
        .when('/realms/:realm/keys-settings', {
            templateUrl : resourceUrl + '/partials/realm-keys.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'RealmKeysDetailCtrl'
        })
        .when('/realms/:realm/identity-provider-settings', {
            templateUrl : resourceUrl + '/partials/realm-identity-provider.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                },
                instance : function(IdentityProviderLoader) {
                    return {};
                },
                providerFactory : function(IdentityProviderFactoryLoader) {
                    return {};
                }
            },
            controller : 'RealmIdentityProviderCtrl'
        })
        .when('/create/identity-provider/:realm/:provider_id', {
            templateUrl : function(params){ return resourceUrl + '/partials/realm-identity-provider-' + params.provider_id + '.html'; },
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                },
                instance : function(IdentityProviderLoader) {
                    return {};
                },
                providerFactory : function(IdentityProviderFactoryLoader) {
                    return new IdentityProviderFactoryLoader();
                }
            },
            controller : 'RealmIdentityProviderCtrl'
        })
        .when('/realms/:realm/identity-provider-settings/provider/:provider_id/:alias', {
            templateUrl : function(params){ return resourceUrl + '/partials/realm-identity-provider-' + params.provider_id + '.html'; },
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                },
                instance : function(IdentityProviderLoader) {
                    return IdentityProviderLoader();
                },
                providerFactory : function(IdentityProviderFactoryLoader) {
                    return IdentityProviderFactoryLoader();
                }
            },
            controller : 'RealmIdentityProviderCtrl'
        })
        .when('/realms/:realm/identity-provider-settings/provider/:provider_id/:alias/export', {
            templateUrl : resourceUrl + '/partials/realm-identity-provider-export.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                },
                identityProvider : function(IdentityProviderLoader) {
                    return IdentityProviderLoader();
                },
                providerFactory : function(IdentityProviderFactoryLoader) {
                    return IdentityProviderFactoryLoader();
                }
            },
            controller : 'RealmIdentityProviderExportCtrl'
        })
        .when('/realms/:realm/default-roles', {
            templateUrl : resourceUrl + '/partials/realm-default-roles.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                },
                roles : function(RoleListLoader) {
                    return RoleListLoader();
                }
            },
            controller : 'RealmDefaultRolesCtrl'
        })
        .when('/realms/:realm/required-credentials', {
            templateUrl : resourceUrl + '/partials/realm-credentials.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'RealmRequiredCredentialsCtrl'
        })
        .when('/realms/:realm/smtp-settings', {
            templateUrl : resourceUrl + '/partials/realm-smtp.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'RealmSMTPSettingsCtrl'
        })
        .when('/realms/:realm/events', {
            templateUrl : resourceUrl + '/partials/realm-events.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'RealmEventsCtrl'
        })
        .when('/realms/:realm/events-settings', {
            templateUrl : resourceUrl + '/partials/realm-events-config.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                },
                eventsConfig : function(RealmEventsConfigLoader) {
                    return RealmEventsConfigLoader();
                }
            },
            controller : 'RealmEventsConfigCtrl'
        })
        .when('/create/user/:realm', {
            templateUrl : resourceUrl + '/partials/user-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                user : function() {
                    return {};
                }
            },
            controller : 'UserDetailCtrl'
        })
        .when('/realms/:realm/users/:user', {
            templateUrl : resourceUrl + '/partials/user-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                user : function(UserLoader) {
                    return UserLoader();
                }
            },
            controller : 'UserDetailCtrl'
        })
        .when('/realms/:realm/users/:user/user-credentials', {
            templateUrl : resourceUrl + '/partials/user-credentials.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                user : function(UserLoader) {
                    return UserLoader();
                }
            },
            controller : 'UserCredentialsCtrl'
        })
        .when('/realms/:realm/users/:user/role-mappings', {
            templateUrl : resourceUrl + '/partials/role-mappings.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                user : function(UserLoader) {
                    return UserLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                }
            },
            controller : 'UserRoleMappingCtrl'
        })
        .when('/realms/:realm/users/:user/sessions', {
            templateUrl : resourceUrl + '/partials/user-sessions.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                user : function(UserLoader) {
                    return UserLoader();
                },
                sessions : function(UserSessionsLoader) {
                    return UserSessionsLoader();
                }
            },
            controller : 'UserSessionsCtrl'
        })
        .when('/realms/:realm/users/:user/federated-identity', {
            templateUrl : resourceUrl + '/partials/user-federated-identity.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                user : function(UserLoader) {
                    return UserLoader();
                },
                federatedIdentities : function(UserFederatedIdentityLoader) {
                    return UserFederatedIdentityLoader();
                }
            },
            controller : 'UserFederatedIdentityCtrl'
        })
        .when('/realms/:realm/users', {
            templateUrl : resourceUrl + '/partials/user-list.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'UserListCtrl'
        })

        .when('/create/role/:realm', {
            templateUrl : resourceUrl + '/partials/role-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                role : function() {
                    return {};
                },
                roles : function(RoleListLoader) {
                    return RoleListLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                }
            },
            controller : 'RoleDetailCtrl'
        })
        .when('/realms/:realm/roles/:role', {
            templateUrl : resourceUrl + '/partials/role-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                role : function(RoleLoader) {
                    return RoleLoader();
                },
                roles : function(RoleListLoader) {
                    return RoleListLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                }
            },
            controller : 'RoleDetailCtrl'
        })
        .when('/realms/:realm/roles', {
            templateUrl : resourceUrl + '/partials/role-list.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                roles : function(RoleListLoader) {
                    return RoleListLoader();
                }
            },
            controller : 'RoleListCtrl'
        })

        .when('/create/role/:realm/clients/:client', {
            templateUrl : resourceUrl + '/partials/client-role-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                role : function() {
                    return {};
                },
                roles : function(RoleListLoader) {
                    return RoleListLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                }
            },
            controller : 'ClientRoleDetailCtrl'
        })
        .when('/realms/:realm/clients/:client/roles/:role', {
            templateUrl : resourceUrl + '/partials/client-role-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                role : function(ClientRoleLoader) {
                    return ClientRoleLoader();
                },
                roles : function(RoleListLoader) {
                    return RoleListLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                }
            },
            controller : 'ClientRoleDetailCtrl'
        })
        .when('/realms/:realm/clients/:client/mappers', {
            templateUrl : resourceUrl + '/partials/client-mappers.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'ClientProtocolMapperListCtrl'
        })
        .when('/realms/:realm/clients/:client/add-mappers', {
            templateUrl : resourceUrl + '/partials/client-mappers-add.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'AddBuiltinProtocolMapperCtrl'
        })
        .when('/realms/:realm/clients/:client/mappers/:id', {
            templateUrl : resourceUrl + '/partials/protocol-mapper-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                },
                mapper : function(ClientProtocolMapperLoader) {
                    return ClientProtocolMapperLoader();
                }

            },
            controller : 'ClientProtocolMapperCtrl'
        })
        .when('/create/client/:realm/:client/mappers', {
            templateUrl : resourceUrl + '/partials/protocol-mapper-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientProtocolMapperCreateCtrl'
        })
        .when('/realms/:realm/clients/:client/sessions', {
            templateUrl : resourceUrl + '/partials/client-sessions.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                sessionCount : function(ClientSessionCountLoader) {
                    return ClientSessionCountLoader();
                }
            },
            controller : 'ClientSessionsCtrl'
        })
        .when('/realms/:realm/clients/:client/credentials', {
            templateUrl : resourceUrl + '/partials/client-credentials.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientCredentialsCtrl'
        })
        .when('/realms/:realm/clients/:client/identity-provider', {
            templateUrl : resourceUrl + '/partials/client-identity-provider.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientIdentityProviderCtrl'
        })
        .when('/realms/:realm/clients/:client/clustering', {
            templateUrl : resourceUrl + '/partials/client-clustering.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientClusteringCtrl'
        })
        .when('/register-node/realms/:realm/clients/:client/clustering', {
            templateUrl : resourceUrl + '/partials/client-clustering-node.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientClusteringNodeCtrl'
        })
        .when('/realms/:realm/clients/:client/clustering/:node', {
            templateUrl : resourceUrl + '/partials/client-clustering-node.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientClusteringNodeCtrl'
        })
        .when('/realms/:realm/clients/:client/saml/keys', {
            templateUrl : resourceUrl + '/partials/client-saml-keys.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientSamlKeyCtrl'
        })
        .when('/realms/:realm/clients/:client/saml/:keyType/import/:attribute', {
            templateUrl : resourceUrl + '/partials/client-saml-key-import.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientCertificateImportCtrl'
        })
        .when('/realms/:realm/clients/:client/saml/:keyType/export/:attribute', {
            templateUrl : resourceUrl + '/partials/client-saml-key-export.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientCertificateExportCtrl'
        })
        .when('/realms/:realm/clients/:client/roles', {
            templateUrl : resourceUrl + '/partials/client-role-list.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                roles : function(ClientRoleListLoader) {
                    return ClientRoleListLoader();
                }
            },
            controller : 'ClientRoleListCtrl'
        })
        .when('/realms/:realm/clients/:client/revocation', {
            templateUrl : resourceUrl + '/partials/client-revocation.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientRevocationCtrl'
        })
        .when('/realms/:realm/clients/:client/scope-mappings', {
            templateUrl : resourceUrl + '/partials/client-scope-mappings.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                }
            },
            controller : 'ClientScopeMappingCtrl'
        })
        .when('/realms/:realm/clients/:client/installation', {
            templateUrl : resourceUrl + '/partials/client-installation.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                }
            },
            controller : 'ClientInstallationCtrl'
        })
        .when('/create/client/:realm', {
            templateUrl : resourceUrl + '/partials/client-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                },
                client : function() {
                    return {};
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'ClientDetailCtrl'
        })
        .when('/realms/:realm/clients/:client', {
            templateUrl : resourceUrl + '/partials/client-detail.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                },
                client : function(ClientLoader) {
                    return ClientLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'ClientDetailCtrl'
        })
        .when('/realms/:realm/clients', {
            templateUrl : resourceUrl + '/partials/client-list.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                clients : function(ClientListLoader) {
                    return ClientListLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }

            },
            controller : 'ClientListCtrl'
        })
        .when('/import/client/:realm', {
            templateUrl : resourceUrl + '/partials/client-import.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'ClientImportCtrl'
        })
        .when('/', {
            templateUrl : resourceUrl + '/partials/home.html',
            controller : 'HomeCtrl'
        })
        .when('/mocks/:realm', {
            templateUrl : resourceUrl + '/partials/realm-detail_mock.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }
            },
            controller : 'RealmDetailCtrl'
        })
        .when('/realms/:realm/sessions/revocation', {
            templateUrl : resourceUrl + '/partials/session-revocation.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'RealmRevocationCtrl'
        })
         .when('/realms/:realm/sessions/realm', {
            templateUrl : resourceUrl + '/partials/session-realm.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                stats : function(RealmClientSessionStatsLoader) {
                    return RealmClientSessionStatsLoader();
                }
            },
            controller : 'RealmSessionStatsCtrl'
        })
        .when('/realms/:realm/user-federation', {
            templateUrl : resourceUrl + '/partials/user-federation.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'UserFederationCtrl'
        })
        .when('/realms/:realm/user-federation/providers/ldap/:instance', {
            templateUrl : resourceUrl + '/partials/federated-ldap.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                instance : function(UserFederationInstanceLoader) {
                    return UserFederationInstanceLoader();
                }
            },
            controller : 'LDAPCtrl'
        })
        .when('/create/user-federation/:realm/providers/ldap', {
            templateUrl : resourceUrl + '/partials/federated-ldap.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                instance : function() {
                    return {};
                }
            },
            controller : 'LDAPCtrl'
        })
        .when('/realms/:realm/user-federation/providers/kerberos/:instance', {
            templateUrl : resourceUrl + '/partials/federated-kerberos.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                instance : function(UserFederationInstanceLoader) {
                    return UserFederationInstanceLoader();
                },
                providerFactory : function() {
                    return { id: "kerberos" };
                }
            },
            controller : 'GenericUserFederationCtrl'
        })
        .when('/create/user-federation/:realm/providers/kerberos', {
            templateUrl : resourceUrl + '/partials/federated-kerberos.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                instance : function() {
                    return {};
                },
                providerFactory : function() {
                    return { id: "kerberos" };
                }
            },
            controller : 'GenericUserFederationCtrl'
        })
        .when('/create/user-federation/:realm/providers/:provider', {
            templateUrl : resourceUrl + '/partials/federated-generic.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                instance : function() {
                    return {

                    };
                },
                providerFactory : function(UserFederationFactoryLoader) {
                    return UserFederationFactoryLoader();
                }
            },
            controller : 'GenericUserFederationCtrl'
        })
        .when('/realms/:realm/user-federation/providers/:provider/:instance', {
            templateUrl : resourceUrl + '/partials/federated-generic.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                instance : function(UserFederationInstanceLoader) {
                    return UserFederationInstanceLoader();
                },
                providerFactory : function(UserFederationFactoryLoader) {
                    return UserFederationFactoryLoader();
                }
            },
            controller : 'GenericUserFederationCtrl'
        })
        .when('/realms/:realm/defense/headers', {
            templateUrl : resourceUrl + '/partials/defense-headers.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }

            },
            controller : 'DefenseHeadersCtrl'
        })
        .when('/realms/:realm/defense/brute-force', {
            templateUrl : resourceUrl + '/partials/brute-force.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                }
            },
            controller : 'RealmBruteForceCtrl'
        })
        .when('/realms/:realm/protocols', {
            templateUrl : resourceUrl + '/partials/protocol-list.html',
            resolve : {
                realm : function(RealmLoader) {
                    return RealmLoader();
                },
                serverInfo : function(ServerInfoLoader) {
                    return ServerInfoLoader();
                }

            },
            controller : 'ProtocolListCtrl'
        })


        .when('/server-info', {
            templateUrl : resourceUrl + '/partials/server-info.html'
        })
        .when('/logout', {
            templateUrl : resourceUrl + '/partials/home.html',
            controller : 'LogoutCtrl'
        })
        .otherwise({
            templateUrl : resourceUrl + '/partials/notfound.html'
        });
} ]);

module.config(function($httpProvider) {
    $httpProvider.responseInterceptors.push('errorInterceptor');

    var spinnerFunction = function(data, headersGetter) {
        if (resourceRequests == 0) {
            loadingTimer = window.setTimeout(function() {
                $('#loading').show();
                loadingTimer = -1;
            }, 500);
        }
        resourceRequests++;
        return data;
    };
    $httpProvider.defaults.transformRequest.push(spinnerFunction);

    $httpProvider.responseInterceptors.push('spinnerInterceptor');
    $httpProvider.interceptors.push('authInterceptor');

});

module.factory('errorInterceptor', function($q, $window, $rootScope, $location, Notifications, Auth) {
    return function(promise) {
        return promise.then(function(response) {
            return response;
        }, function(response) {
            if (response.status == 401) {
                Auth.authz.logout();
             } else if (response.status == 403) {
                Notifications.error("Forbidden");
            } else if (response.status == 404) {
                Notifications.error("Not found");
            } else if (response.status) {
                if (response.data && response.data.errorMessage) {
                    Notifications.error(response.data.errorMessage);
                } else {
                    Notifications.error("An unexpected server error has occurred");
                }
            }
            return $q.reject(response);
        });
    };
});

module.factory('spinnerInterceptor', function($q, $window, $rootScope, $location) {
    return function(promise) {
        return promise.then(function(response) {
            resourceRequests--;
            if (resourceRequests == 0) {
                if(loadingTimer != -1) {
                    window.clearTimeout(loadingTimer);
                    loadingTimer = -1;
                }
                $('#loading').hide();
            }
            return response;
        }, function(response) {
            resourceRequests--;
            if (resourceRequests == 0) {
                if(loadingTimer != -1) {
                    window.clearTimeout(loadingTimer);
                    loadingTimer = -1;
                }
                $('#loading').hide();
            }

            return $q.reject(response);
        });
    };
});

// collapsable form fieldsets
module.directive('collapsable', function() {
    return function(scope, element, attrs) {
        element.click(function() {
            $(this).toggleClass('collapsed');
            $(this).find('.toggle-icons').toggleClass('kc-icon-collapse').toggleClass('kc-icon-expand');
            $(this).find('.toggle-icons').text($(this).text() == "Icon: expand" ? "Icon: collapse" : "Icon: expand");
            $(this).parent().find('.form-group').toggleClass('hidden');
        });
    }
});

// collapsable form fieldsets
module.directive('uncollapsed', function() {
    return function(scope, element, attrs) {
        element.prepend('<span class="kc-icon-collapse toggle-icons">Icon: collapse</span>');
        element.click(function() {
            $(this).toggleClass('collapsed');
            $(this).find('.toggle-icons').toggleClass('kc-icon-collapse').toggleClass('kc-icon-expand');
            $(this).find('.toggle-icons').text($(this).text() == "Icon: expand" ? "Icon: collapse" : "Icon: expand");
            $(this).parent().find('.form-group').toggleClass('hidden');
        });
    }
});

// collapsable form fieldsets
module.directive('collapsed', function() {
    return function(scope, element, attrs) {
        element.prepend('<span class="kc-icon-expand toggle-icons">Icon: expand</span>');
        element.parent().find('.form-group').toggleClass('hidden');
        element.click(function() {
            $(this).toggleClass('collapsed');
            $(this).find('.toggle-icons').toggleClass('kc-icon-collapse').toggleClass('kc-icon-expand');
            $(this).find('.toggle-icons').text($(this).text() == "Icon: expand" ? "Icon: collapse" : "Icon: expand");
            $(this).parent().find('.form-group').toggleClass('hidden');
        });
    }
});

/**
 * Directive for presenting an ON-OFF switch for checkbox.
 * Usage: <input ng-model="mmm" name="nnn" id="iii" onoffswitch [on-text="ooo" off-text="fff"] />
 */
module.directive('onoffswitch', function() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            name: '@',
            id: '@',
            ngModel: '=',
            ngDisabled: '=',
            kcOnText: '@onText',
            kcOffText: '@offText'
        },
        // TODO - The same code acts differently when put into the templateURL. Find why and move the code there.
        //templateUrl: "templates/kc-switch.html",
        template: "<span><div class='onoffswitch' tabindex='0'><input type='checkbox' ng-model='ngModel' ng-disabled='ngDisabled' class='onoffswitch-checkbox' name='{{name}}' id='{{id}}'><label for='{{id}}' class='onoffswitch-label'><span class='onoffswitch-inner'><span class='onoffswitch-active'>{{kcOnText}}</span><span class='onoffswitch-inactive'>{{kcOffText}}</span></span><span class='onoffswitch-switch'></span></label></div></span>",
        compile: function(element, attrs) {
            /*
            We don't want to propagate basic attributes to the root element of directive. Id should be passed to the
            input element only to achieve proper label binding (and validity).
            */
            element.removeAttr('name');
            element.removeAttr('id');

            if (!attrs.onText) { attrs.onText = "ON"; }
            if (!attrs.offText) { attrs.offText = "OFF"; }

            element.bind('keydown', function(e){
                var code = e.keyCode || e.which;
                if (code === 32 || code === 13) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    $(e.target).find('input').click();
                }
            });
        }
    }
});

/**
 * Directive for presenting an ON-OFF switch for checkbox.
 * This directive provides some additional capabilities to the default onoffswitch such as:
 *
 * - Dynamic values for id and name attributes. Useful if you need to use this directive inside a ng-repeat
 * - Specific scope to specify the value. Instead of just true or false.
 *
 * Usage: <input ng-model="mmm" name="nnn" id="iii" kc-onoffswitch-model [on-text="ooo" off-text="fff"] />
 */
module.directive('onoffswitchmodel', function() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            name: '=',
            id: '=',
            value: '=',
            ngModel: '=',
            ngDisabled: '=',
            kcOnText: '@onText',
            kcOffText: '@offText'
        },
        // TODO - The same code acts differently when put into the templateURL. Find why and move the code there.
        //templateUrl: "templates/kc-switch.html",
        template: "<span><div class='onoffswitch' tabindex='0'><input type='checkbox' ng-true-value='{{value}}' ng-model='ngModel' ng-disabled='ngDisabled' class='onoffswitch-checkbox' name='kc{{name}}' id='kc{{id}}'><label for='kc{{id}}' class='onoffswitch-label'><span class='onoffswitch-inner'><span class='onoffswitch-active'>{{kcOnText}}</span><span class='onoffswitch-inactive'>{{kcOffText}}</span></span><span class='onoffswitch-switch'></span></label></div></span>",
        compile: function(element, attrs) {

            if (!attrs.onText) { attrs.onText = "ON"; }
            if (!attrs.offText) { attrs.offText = "OFF"; }

            element.bind('keydown click', function(e){
                var code = e.keyCode || e.which;
                if (code === 32 || code === 13) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    $(e.target).find('input').click();
                }
            });
        }
    }
});

/**
 * Directive for presenting an ON-OFF switch for checkbox.
 * This directive provides some additional capabilities to the default onoffswitch such as:
 *
 * - Specific scope to specify the value. Instead of just true or false.
 *
 * Usage: <input ng-model="mmm" name="nnn" id="iii" onoffswitchvalue [on-text="ooo" off-text="fff"] />
 */
module.directive('onoffswitchvalue', function() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            name: '@',
            id: '@',
            value: '=',
            ngModel: '=',
            ngDisabled: '=',
            kcOnText: '@onText',
            kcOffText: '@offText'
        },
        // TODO - The same code acts differently when put into the templateURL. Find why and move the code there.
        //templateUrl: "templates/kc-switch.html",
        template: "<span><div class='onoffswitch' tabindex='0'><input type='checkbox' ng-true-value='{{value}}' ng-model='ngModel' ng-disabled='ngDisabled' class='onoffswitch-checkbox' name='{{name}}' id='{{id}}'><label for='{{id}}' class='onoffswitch-label'><span class='onoffswitch-inner'><span class='onoffswitch-active'>{{kcOnText}}</span><span class='onoffswitch-inactive'>{{kcOffText}}</span></span><span class='onoffswitch-switch'></span></label></div></span>",
        compile: function(element, attrs) {
            /*
             We don't want to propagate basic attributes to the root element of directive. Id should be passed to the
             input element only to achieve proper label binding (and validity).
             */
            element.removeAttr('name');
            element.removeAttr('id');

            if (!attrs.onText) { attrs.onText = "ON"; }
            if (!attrs.offText) { attrs.offText = "OFF"; }

            element.bind('keydown', function(e){
                var code = e.keyCode || e.which;
                if (code === 32 || code === 13) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    $(e.target).find('input').click();
                }
            });
        }
    }
});

module.directive('kcInput', function() {
    var d = {
        scope : true,
        replace : false,
        link : function(scope, element, attrs) {
            var form = element.children('form');
            var label = element.children('label');
            var input = element.children('input');

            var id = form.attr('name') + '.' + input.attr('name');

            element.attr('class', 'control-group');

            label.attr('class', 'control-label');
            label.attr('for', id);

            input.wrap('<div class="controls"/>');
            input.attr('id', id);

            if (!input.attr('placeHolder')) {
                input.attr('placeHolder', label.text());
            }

            if (input.attr('required')) {
                label.append(' <span class="required">*</span>');
            }
        }
    };
    return d;
});

module.directive('kcEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.kcEnter);
                });

                event.preventDefault();
            }
        });
    };
});

module.directive('kcSave', function ($compile, Notifications) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attr, ctrl) {
            elem.addClass("btn btn-primary btn-lg");
            elem.attr("type","submit");
            elem.bind('click', function() {
                $scope.$apply(function() {
                    var form = elem.closest('form');
                    if (form && form.attr('name')) {
                        var ngValid = form.find('.ng-valid');
                        if ($scope[form.attr('name')].$valid) {
                            //ngValid.removeClass('error');
                            ngValid.parent().removeClass('has-error');
                            $scope['save']();
                        } else {
                            Notifications.error("Missing or invalid field(s). Please verify the fields in red.")
                            //ngValid.removeClass('error');
                            ngValid.parent().removeClass('has-error');

                            var ngInvalid = form.find('.ng-invalid');
                            //ngInvalid.addClass('error');
                            ngInvalid.parent().addClass('has-error');
                        }
                    }
                });
            })
        }
    }
});

module.directive('kcReset', function ($compile, Notifications) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attr, ctrl) {
            elem.addClass("btn btn-default btn-lg");
            elem.attr("type","submit");
            elem.bind('click', function() {
                $scope.$apply(function() {
                    var form = elem.closest('form');
                    if (form && form.attr('name')) {
                        form.find('.ng-valid').removeClass('error');
                        form.find('.ng-invalid').removeClass('error');
                        $scope['reset']();
                    }
                })
            })
        }
    }
});

module.directive('kcCancel', function ($compile, Notifications) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attr, ctrl) {
            elem.addClass("btn btn-default btn-lg");
            elem.attr("type","submit");
        }
    }
});

module.directive('kcDelete', function ($compile, Notifications) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attr, ctrl) {
            elem.addClass("btn btn-danger btn-lg");
            elem.attr("type","submit");
        }
    }
});


module.directive('kcDropdown', function ($compile, Notifications) {
    return {
        scope: {
            kcOptions: '=',
            kcModel: '=',
            id: "=",
            kcPlaceholder: '@'
        },
        restrict: 'EA',
        replace: true,
        templateUrl: resourceUrl + '/templates/kc-select.html',
        link: function(scope, element, attr) {
            scope.updateModel = function(item) {
                scope.kcModel = item;
            };
        }
    }
});

module.directive('kcReadOnly', function() {
    var disabled = {};

    var d = {
        replace : false,
        link : function(scope, element, attrs) {
            var disable = function(i, e) {
                if (!e.disabled) {
                    disabled[e.tagName + i] = true;
                    e.disabled = true;
                }
            }

            var enable = function(i, e) {
                if (disabled[e.tagName + i]) {
                    e.disabled = false;
                    delete disabled[i];
                }
            }

            scope.$watch(attrs.kcReadOnly, function(readOnly) {
                if (readOnly) {
                    console.debug('readonly');
                    element.find('input').each(disable);
                    element.find('button').each(disable);
                    element.find('select').each(disable);
                    element.find('textarea').each(disable);
                } else {
                    element.find('input').each(enable);
                    element.find('input').each(enable);
                    element.find('button').each(enable);
                    element.find('select').each(enable);
                    element.find('textarea').each(enable);
                }
            });
        }
    };
    return d;
});

module.directive('kcNavigation', function ($compile, Notifications) {
    return {
        scope: true,
        restrict: 'E',
        replace: true,
        templateUrl: resourceUrl + '/templates/kc-navigation.html',

        compile: function(element, attrs){
            if (!attrs.kcSocial) {
                attrs.kcSocial = false;
            }
        }
    }
});

module.directive('kcNavigationClient', function () {
    return {
        scope: true,
        restrict: 'E',
        replace: true,
        templateUrl: resourceUrl + '/templates/kc-navigation-client.html'
    }
});

/*
*  Used to select the element (invoke $(elem).select()) on specified action list.
*  Usages kc-select-action="click mouseover"
*  When used in the textarea element, this will select/highlight the textarea content on specified action (i.e. click).
*/
module.directive('kcSelectAction', function ($compile, Notifications) {
    return {
        restrict: 'A',
        compile: function (elem, attrs) {

            var events = attrs.kcSelectAction.split(" ");

            for(var i=0; i < events.length; i++){

                elem.bind(events[i], function(){
                    elem.select();
                });
            }
        }
    }
});

module.filter('remove', function() {
    return function(input, remove, attribute) {
        if (!input || !remove) {
            return input;
        }

        var out = [];
        for ( var i = 0; i < input.length; i++) {
            var e = input[i];

            if (Array.isArray(remove)) {
                for (var j = 0; j < remove.length; j++) {
                    if (attribute) {
                        if (remove[j][attribute] == e[attribute]) {
                            e = null;
                            break;
                        }
                    } else {
                        if (remove[j] == e) {
                            e = null;
                            break;
                        }
                    }
                }
            } else {
                if (attribute) {
                    if (remove[attribute] == e[attribute]) {
                        e = null;
                    }
                } else {
                    if (remove == e) {
                        e = null;
                    }
                }
            }

            if (e != null) {
                out.push(e);
            }
        }

        return out;
    };
});

module.filter('capitalize', function() {
    return function(input) {
        if (!input) {
            return;
        }
        var result = input.substring(0, 1).toUpperCase();
        var s = input.substring(1);
        for (var i=0; i<s.length ; i++) {
            var c = s[i];
            if (c.match(/[A-Z]/)) {
                result = result.concat(" ")
            };
            result = result.concat(c);
        };
        return result;
    };
});