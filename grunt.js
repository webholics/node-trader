/*global module:false*/

'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        meta: {
            shebang: "#!/usr/bin/env node"
        },
        coffee: {
            module: {
                src: ['src/**/*.coffee'],
                dest: '.',
                options: {
                    bare: false,
                    preserve_dirs: true,
                    base_path: 'src'
                }
            }
        },
        concat: {
            bin: {
                src: ['<banner:meta.shebang>', 'bin/cli.js'],
                dest: 'bin/cli.js'
            }
        },
        clean: {
            js: ['bin/*', 'lib/*']
        },
        simplemocha: {
            all: {
                src: 'test/**/*.js',
                options: {
                    timeout: 60000, // we need huge timeout to test endpoints
                    globals: ['confidence'],
                    reporter: 'spec'
                }
            }
        },
        watch: {
            files: ['src/**/*.coffee'],
            tasks: 'default'
        }
    });

    grunt.loadNpmTasks('grunt-coffee');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('default', 'coffee concat');
};