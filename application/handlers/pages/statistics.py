#!/usr/bin/env python
# -*- coding: utf-8 -*-
from application.handlers.base import BaseHandler
from models import Counter
import logging


class StatisticsDashboard(BaseHandler):
    def get(self):
        self.tv['page'] = 'statistics'
        counter = None
        self.render('geostore-statistics2.html')

class StatisticsDashboard2(BaseHandler):
    def get(self):
        self.tv['page'] = 'statistics'
        counter = None
        self.tv['data'] = None

        counter_id = self.request.get('counter_id')
        if counter_id:
            counter = Counter.get_by_id(counter_id)

        # just get latest count
        if not counter:
            counter = Counter.query().order(-Counter.created).get()

        if counter:
            self.tv['data'] = counter.data.copy()
        else:
            self.tv['data'] = {}

        self.render()







