export const ExperimentalGetTinaClient = () => {
  return {
    getAuthorList: async () => {
      return {
        "data": {
          "getAuthorList": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "content/authors/napolean.md",
                  "sys": {
                    "filename": "napolean",
                    "basename": "napolean.md",
                    "breadcrumbs": [
                      "napolean"
                    ],
                    "path": "content/authors/napolean.md",
                    "relativePath": "napolean.md",
                    "extension": ".md"
                  },
                  "data": {
                    "name": "Napolean",
                    "title": null,
                    "avatar": "https://images.unsplash.com/photo-1606721977440-13e6c3a3505a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=344&q=80"
                  }
                }
              },
              {
                "node": {
                  "id": "content/authors/pedro.md",
                  "sys": {
                    "filename": "pedro",
                    "basename": "pedro.md",
                    "breadcrumbs": [
                      "pedro"
                    ],
                    "path": "content/authors/pedro.md",
                    "relativePath": "pedro.md",
                    "extension": ".md"
                  },
                  "data": {
                    "name": "Pedro",
                    "title": null,
                    "avatar": "https://images.unsplash.com/photo-1555959910-80920d0698a4?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1301&q=80"
                  }
                }
              }
            ]
          },
        }
      }
    },
    getPostList: async () => {
      return {
        "data": {
          "getPostList": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "content/posts/first-post.mdx",
                  "sys": {
                    "filename": "first-post",
                    "basename": "first-post.mdx",
                    "breadcrumbs": [
                      "first-post"
                    ],
                    "path": "content/posts/first-post.mdx",
                    "relativePath": "first-post.mdx",
                    "extension": ".mdx"
                  },
                  "data": {
                    "title": "First Post",
                    "heroImg": null,
                    "excerpt": {
                      "type": "root",
                      "children": [
                        {
                          "type": "p",
                          "children": [
                            {
                              "type": "text",
                              "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus."
                            }
                          ]
                        }
                      ]
                    },
                    "author": {
                      "id": "content/authors/pedro.md"
                    },
                    "date": "2021-07-03T20:30:00.000Z",
                    "body": {
                      "type": "root",
                      "children": []
                    }
                  }
                }
              },
              {
                "node": {
                  "id": "content/posts/second-post.mdx",
                  "sys": {
                    "filename": "second-post",
                    "basename": "second-post.mdx",
                    "breadcrumbs": [
                      "second-post"
                    ],
                    "path": "content/posts/second-post.mdx",
                    "relativePath": "second-post.mdx",
                    "extension": ".mdx"
                  },
                  "data": {
                    "title": "Second Post",
                    "heroImg": null,
                    "excerpt": {
                      "type": "root",
                      "children": []
                    },
                    "author": {
                      "id": "content/authors/napolean.md"
                    },
                    "date": "2021-07-12T07:00:00.000Z",
                    "body": {
                      "type": "root",
                      "children": [
                        {
                          "type": "h1",
                          "children": [
                            {
                              "type": "text",
                              "text": "This is the page title"
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "type": "text",
                              "text": "sdfsdfsdf"
                            }
                          ]
                        },
                        {
                          "type": "h2",
                          "children": [
                            {
                              "type": "text",
                              "text": "sfsdfsdf"
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "type": "text",
                              "text": "sdfsdfsdf"
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            ]
          },
        }
      }
    },
    getPageList: async () => {
      return {
        "data": {
          "getPageList": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "content/pages/about.md",
                  "sys": {
                    "filename": "about",
                    "basename": "about.md",
                    "breadcrumbs": [
                      "about"
                    ],
                    "path": "content/pages/about.md",
                    "relativePath": "about.md",
                    "extension": ".md"
                  },
                  "data": {
                    "title": "",
                    "body": {
                      "type": "root",
                      "children": []
                    }
                  }
                }
              },
              {
                "node": {
                  "id": "content/pages/home.md",
                  "sys": {
                    "filename": "home",
                    "basename": "home.md",
                    "breadcrumbs": [
                      "home"
                    ],
                    "path": "content/pages/home.md",
                    "relativePath": "home.md",
                    "extension": ".md"
                  },
                  "data": {
                    "title": null,
                    "body": {
                      "type": "root",
                      "children": [
                        {
                          "type": "h1",
                          "children": [
                            {
                              "type": "text",
                              "text": "Heading 1"
                            }
                          ]
                        },
                        {
                          "type": "h2",
                          "children": [
                            {
                              "type": "text",
                              "text": "Heading 2"
                            }
                          ]
                        },
                        {
                          "type": "h3",
                          "children": [
                            {
                              "type": "text",
                              "text": "Heading 3"
                            }
                          ]
                        },
                        {
                          "type": "h4",
                          "children": [
                            {
                              "type": "text",
                              "text": "Heading 4"
                            }
                          ]
                        },
                        {
                          "type": "h5",
                          "children": [
                            {
                              "type": "text",
                              "text": "Heading 5"
                            }
                          ]
                        },
                        {
                          "type": "h6",
                          "children": [
                            {
                              "type": "text",
                              "text": "Heading 6"
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "type": "text",
                              "text": "Paragraph"
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "type": "a",
                              "url": "www.google.at",
                              "children": [
                                {
                                  "type": "text",
                                  "text": "Link"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "type": "img",
                              "url": "",
                              "alt": "",
                              "caption": null
                            }
                          ]
                        },
                        {
                          "type": "blockquote",
                          "children": [
                            {
                              "type": "p",
                              "children": [
                                {
                                  "type": "text",
                                  "text": "Quote"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "type": "ul",
                          "children": [
                            {
                              "type": "li",
                              "children": [
                                {
                                  "type": "lic",
                                  "children": [
                                    {
                                      "type": "text",
                                      "text": "- U List"
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              "type": "li",
                              "children": [
                                {
                                  "type": "lic",
                                  "children": [
                                    {
                                      "type": "text",
                                      "text": "- U List"
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              "type": "li",
                              "children": [
                                {
                                  "type": "lic",
                                  "children": [
                                    {
                                      "type": "text",
                                      "text": "- U List"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "type": "ol",
                          "children": [
                            {
                              "type": "li",
                              "children": [
                                {
                                  "type": "lic",
                                  "children": [
                                    {
                                      "type": "text",
                                      "text": "- O List"
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              "type": "li",
                              "children": [
                                {
                                  "type": "lic",
                                  "children": [
                                    {
                                      "type": "text",
                                      "text": "- O List"
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              "type": "li",
                              "children": [
                                {
                                  "type": "lic",
                                  "children": [
                                    {
                                      "type": "text",
                                      "text": "- O List"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "code": true,
                              "text": "Code"
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "bold": true,
                              "type": "text",
                              "text": "Bold",
                              "value": "Bold"
                            }
                          ]
                        },
                        {
                          "type": "code_block",
                          "lang": "js",
                          "children": [
                            {
                              "type": "code_line",
                              "children": [
                                {
                                  "type": "text",
                                  "text": "console.log('Hello World')"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "italic": true,
                              "type": "text",
                              "text": "Italic",
                              "value": "Italic"
                            }
                          ]
                        },
                        {
                          "type": "p",
                          "children": [
                            {
                              "type": "a",
                              "url": "www.google.at",
                              "children": [
                                {
                                  "code": true,
                                  "text": "text"
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            ]
          },
        }
      }
    }
  }
}

