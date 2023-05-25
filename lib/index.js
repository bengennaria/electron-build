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
const aliasedAvailableBuildFlavors = { production: 'npm_config_production', preview: 'npm_config_preview' }
const availableTargetPlatforms = [ 'mac', 'macos', 'darwin', 'win', 'windows', 'win32', 'linux' ]
const aliasedAvailableTargetPlatforms = { mac: 'npm_config_mac', macos: 'npm_config_macos', darwin: 'npm_config_darwin', win: 'npm_config_win', windows: 'npm_config_windows', win32: 'npm_config_win32', linux: 'npm_config_linux' }

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
    let argv

    try {
        argv = minimist(JSON.parse(process.env).original, {
            'boolean': [
                ...availableTargetPlatforms,
                ...availableBuildFlavors
            ],
            'alias': {
              ...aliasedAvailableTargetPlatforms,
              ...aliasedAvailableBuildFlavors
            },
            'unknown': () => { return false }
        })
    } catch (error) {
        logger.error('could not parse arguments', error)
    }


    /**
     * Resolve ArgumentsSettings
     */

    // Get true Boolean Arguments
    const argumentList = Object.keys(_.pickBy(argv, Boolean))

    // Filter Platforms
    let platforms = argumentList.filter(argument => availableTargetPlatforms.includes(argument))
    platforms =  _.isEmpty(platforms) ? defaultTargetPlatforms : platforms

    // Filter Build Flavors
    let flavors = argumentList.filter(argument => availableBuildFlavors.includes(argument))
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

