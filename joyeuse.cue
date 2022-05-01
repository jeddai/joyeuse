package joyeuse

import (
	"dagger.io/dagger"
	"universe.dagger.io/docker"
)

#JoyeuseApp: {
	app: dagger.#FS
	image: _build.output
	_build: docker.#Build & {
		steps: [
			docker.#Pull & {
				source: "node:16.14.0-slim"
			},
			docker.#Copy & {
				contents: app
				dest:			"/app"
			},
			docker.#Run & {
				workdir: "/app"
				command: {
					name: "npm"
					args: ["install"]
				}
			},
			docker.#Run & {
				workdir: "/app"
				command: {
					name: "npm"
					args: ["run", "build", "--", "--output-hashing", "all"]
				}
			}
		]
	}
}

#JoyeuseServer: {
	server: dagger.#FS
	image: _build.output
	_build: docker.#Build & {
		steps: [
			docker.#Pull & {
				source: "node:16.14.0-slim"
			},
			docker.#Copy & {
				contents: server
				dest:			"/app"
			},
			docker.#Run & {
				workdir: "/app"
				command: {
					name: "npm"
					args: ["install"]
				}
			},
			docker.#Run & {
				workdir: "/app"
				command: {
					name: "npm"
					args: ["run", "build"]
				}
			}
		]
	}
}

#JoyeuseBuild: {
	app: docker.#Image
	server: docker.#Image
	image: _build.output
	_build: docker.#Build & {
		steps: [
			docker.#Pull & {
				source: "node:16.14.0-slim"
			},
			docker.#Copy & {
				contents: server.rootfs
				source: "/app/package.json"
				dest:		"."
			},
			docker.#Copy & {
				contents: server.rootfs
				source: "/app/dist"
				dest:		"dist"
			},
			docker.#Run & {
				command: {
					name: "mkdir"
					args: ["locale"]
				}
			},
			docker.#Copy & {
				contents: server.rootfs
				source: "/app/locale/*.yaml"
				dest:		"locale/"
			},
			docker.#Copy & {
				contents: app.rootfs
				source: "/app/dist"
				dest:		"static"
			},
			docker.#Run & {
				command: {
				  name: "npm"
				  args: ["install"]
				  flags: {
					  "--only": "prod",
					  "--no-shrinkwrap": true
				  }
				}
			},
			docker.#Set & {
				config: cmd: ["npm", "start"]
			}
		]
	}
}

#releaseJoyeuse: {
	imageName: string
	imageTag: string
	user: string
	pass: dagger.#Secret

	latest: docker.#Pull & {
		source: "\(imageName):latest"
		resolveMode: "forcePull"
		auth: {
			username: user
			secret:		pass
		}
	}

	docker.#Push & {
		dest: "\(imageName):\(imageTag)"
		auth: {
			username: user
			secret:		pass
		}
		image: latest.image
	}
}

dagger.#Plan & {
	client: {
		filesystem: {
			"./app": read: {
				contents: dagger.#FS
			}
			"./server": read: {
				contents: dagger.#FS
				exclude: ["node_modules"]
			}
		}
		env: {
			CI_REGISTRY_USER: 		string | *""
			CI_REGISTRY_PASSWORD: dagger.#Secret
			CI_REGISTRY: 					string | *""
			CI_REGISTRY_IMAGE: 		string | *""
			CI_DEFAULT_BRANCH: 		string | *""
			CI_COMMIT_BRANCH: 		string | *""
			CI_COMMIT_REF_SLUG: 	string | *""
			CI_COMMIT_TAG: 				string | *""
		}
	}

	actions: {
		buildApp: #JoyeuseApp & {
			app: client.filesystem."./app".read.contents
		}
		buildServer: #JoyeuseServer & {
			server: client.filesystem."./server".read.contents
		}
		build: #JoyeuseBuild & {
			app: actions.buildApp.image
			server: actions.buildServer.image
		}
		pushFromMain: docker.#Push & {
			dest: "\(client.env.CI_REGISTRY_IMAGE):latest"
			auth: {
				username: client.env.CI_REGISTRY_USER
				secret:		client.env.CI_REGISTRY_PASSWORD
			}
			image: actions.build.image
		}
		pushFromCommit: docker.#Push & {
			dest: "\(client.env.CI_REGISTRY_IMAGE):\(client.env.CI_COMMIT_REF_SLUG)"
			image: actions.build.image
		}
		release: #releaseJoyeuse & {
			imageName: client.env.CI_REGISTRY_IMAGE
			imageTag:	 client.env.CI_COMMIT_TAG
			user:			 client.env.CI_REGISTRY_USER
			pass:			 client.env.CI_REGISTRY_PASSWORD
		}
	}
}