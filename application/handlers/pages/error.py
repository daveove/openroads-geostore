from application.handlers.base import BaseHandler

class ErrorHandler(BaseHandler):
    def get(self, error):
        """
            Handles the 404 errors.
            Shows a 404 error page if page is not found.
        """
        self.tv["show_breadcrumb"] = False
        self.tv["show_add_dataset"] = False
        self.render('error404.html')