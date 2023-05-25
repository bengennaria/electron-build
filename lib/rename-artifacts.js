'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const fs = require('fs-extra')
const path = require('path')

/**
 * Modules
 * External
 * @constant
 */
const _ = require('lodash')
const appRootPath = require('app-root-path')['path']
const jsonfile = require('jsonfile')
const logger = require('@sidneys/logger')({ timestamp: false })
const { findInstallerSync } = require('@sidneys/electron-deploy-utils')

/**
 * Filesystem
 * @constant
 */
const packageJsonFilePath = path.join(appRootPath, 'package.json')

/**
 * Modules
 * Internal
 * @constant
 */
// const packageJson = require(packageJsonFilePath)


/**
 * Renames installers to <name>-<version>-<arch>
 * @param {function=} callback - Completion callback
 */
let renameArtifacts = (callback = () => {}) => {
    logger.debug('renameArtifacts')

    // Parse package.json
    const packageJson = jsonfile.readFileSync(packageJsonFilePath)

    // Filesystem
    const installerDirectory = path.join(appRootPath, String(packageJson.build.directories.output))

    // Lookup artifacts
    const artifactList = findInstallerSync(installerDirectory, packageJson.version)

    // Rename artifacts
    let renameCount = 0
    artifactList.forEach((filePath, fileIndex, filePathList) => {
        // Filesystem
        const fileExtension = path.extname(filePath)
        const fileDirectory = path.dirname(filePath)
        const fileName = path.basename(filePath)
        // noinspection UnnecessaryLocalVariableJS
        const fileTitle = path.basename(fileName, fileExtension)

        // Initialize new file title
        let outputFileTitle = fileTitle

        // Convert to lowercase
        outputFileTitle = _.toLower(outputFileTitle)

        // Replace productName with name
        outputFileTitle = outputFileTitle.replace(packageJson.productName, packageJson.name)

        // Remove version
        // newFilename = _(newFilename).replace(packageJson.version, '')

        // Replace space with hyphen
        outputFileTitle = outputFileTitle.replace(/ /g, '-')

        // Replace underscore with hyphen
        outputFileTitle = outputFileTitle.replace(/_/g, '-')

        // Merge consecutive hyphens
        outputFileTitle = outputFileTitle.replace(/-+/g, '-')

        // Replace ".x86-64" with "-x86_64"
        outputFileTitle = outputFileTitle.replace(/.x86-64/g, '-x86_64')

        // Trim hyphen
        outputFileTitle = _(outputFileTitle).trim()

        // Resolve new file name, new file path
        const outputFileName = `${outputFileTitle}${fileExtension}`
        const outputFilePath = path.join(fileDirectory, outputFileName)

        // DEBUG
        logger.debug('artifact', 'filename', 'input', path.basename(filePath))
        logger.debug('artifact', 'filename', 'output', path.basename(outputFilePath))

        // DEBUG
        // require('chalkline').green()

        // Rename file
        if (filePath !== outputFilePath) {
            logger.info('artifact', 'renaming', fileName, '-->', outputFileName)

            fs.renameSync(filePath, outputFilePath)

            renameCount++
        }

        // Last iteration?
        if (fileIndex === (filePathList.length - 1)) {
            logger.info('artifacts', 'total:', filePathList.length)
            logger.info('artifacts', 'renamed:', renameCount)

            // Callback
            callback()
        }
    })
}

/**
 * @exports
 */
module.exports = renameArtifacts
