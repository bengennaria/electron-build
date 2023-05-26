#!/usr/bin/env node
'use strict'


/**
 * Modules
 * External
 * @constant
 */
const _ = require('lodash')
const logger = require('@bengennaria/logger')({ timestamp: false })
const minimist = require('minimist')
const releasenotes = require('@bengennaria/releasenotes')

/**
 * Modules
 * Internal
 * @constant
 */
const renameArtifacts = require('./rename-artifacts')
const buildPlatforms = require('./build')

/**
 * Available Configuration Arguments
 * @constant {Array}
 */
const availableBuildFlavors = [ 'production', 'preview' ]
const availableTargetPlatforms = [ 'mac', 'macos', 'darwin', 'win', 'windows', 'win32', 'linux' ]

/**
 * Default Configuration Arguments
 * @constant {Array}
 * @default
 */
const defaultBuildFlavors = [ 'production' ]
const defaultTargetPlatforms = [ process.platform ]


/**
 * Main
 */
if (require.main === module) {
    /**
     * Parse Arguments
     */
    let platforms = [];
    let flavors = [];

    availableTargetPlatforms.forEach(function(value, index) {
        if(process.env[value] || process.env['npm_config_' + value]) {
            platforms[value] = true;
        }
    })
    platforms =  _.isEmpty(platforms) ? defaultTargetPlatforms : platforms

    availableBuildFlavors.forEach(function(value, index) {
        if(process.env[value] || process.env['npm_config_' + value]) {
            flavors[value] = true;
        }
    })
    flavors =  _.isEmpty(flavors) ? defaultBuildFlavors : flavors

    // Generate Release Notes
    releasenotes.writeAsMarkdown()

    /**
     * Build
     */
    buildPlatforms(platforms, flavors, () => {
        // Rename Artifacts
        // TODO: Make optional
        // renameArtifacts()
    })
}

