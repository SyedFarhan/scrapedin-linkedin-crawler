const scrapedin = require('scrapedin')
const saveProfile = require('./saveProfile')
const logger = require('./logger')


const rootProfiles = [
  /* place linkedin profile links here! */
]

const crawledProfiles = []

const crawlProfile = async(profileScraper, profileUrls, depth = 0) => {
  logger.info(`starting to crawl ${profileUrls.length} profile(s) on depth:${depth}`)

  const profileIds = profileUrls.map((url) => getProfileIdFromUrl(url))
  const newProfiles = profileIds.filter((id) => !crawledProfiles.includes(id))

  logger.info(`profiles going to crawl: ${newProfiles.length} on depth:${depth}`)

  let relatedProfilesToCrawl = []

  for(let i = 0; i < newProfiles.length; i++) {
    try{
      const profile = await profileScraper("https://www.linkedin.com/in/" + newProfiles[i])

      await saveProfile(newProfiles[i] + ".json", profile)
      logger.info(`new ${profile.peopleAlsoViewed.length} profile(s) found for id:${newProfiles[i]} on depth:${depth}`)
      logger.info(`saved profile ${newProfiles[i]}: ${i} of ${newProfiles.length - 1} on depth:${depth}`)

      crawledProfiles.push(newProfiles[i])
      relatedProfilesToCrawl = relatedProfilesToCrawl.concat(profile.peopleAlsoViewed.map(({ user }) => user))
    } catch (e) {
      logger.error(`error on crawling profile: ${newProfiles[i]} \n ${e}`)
    }
  }

  await crawlProfile(profileScraper, relatedProfilesToCrawl, depth + 1)

  logger.info('index', `ending crawling depth: ${depth}`)
  return
}

const getProfileIdFromUrl = (url) => {
  const inIndex = url.indexOf('in/') + 3
  const id =  url.substring(inIndex).replace('/', '')
  return id
}

scrapedin({ email: '', password: '', isHeadless: false, hasToLog: true })
  .then((profileScraper) => crawlProfile(profileScraper, rootProfiles) )